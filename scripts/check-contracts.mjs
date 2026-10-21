import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const memory = new Map();
const localStorage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
};

// Exercise the real services/stores without browser UI or network requests.
function load(file, dependencies = {}, globals = {}) {
  const exports = {};
  const source = readFileSync(file, 'utf8').replaceAll(
    'import.meta.env.VITE_API_URL', JSON.stringify('https://api.example.test'),
  );
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  vm.runInNewContext(code, {
    exports,
    require: (name) => name in dependencies ? dependencies[name] : require(name),
    FormData, File, Blob, localStorage, ...globals,
  });
  return exports;
}

const apiTypes = load('src/data/models/api/api.types.ts');
const axiosClient = load('src/service/api/axiosClient.ts', {
  '../../data/models/api/api.types': apiTypes,
  '../../store/auth.store': { useAuthStore: { getState: () => ({}) } },
  '../../config/auth.config': { isAccessTokenExpired: () => false },
}).default;
const axiosModule = { default: axiosClient, __esModule: true };
const requests = [];
axiosClient.defaults.adapter = async (config) => {
  requests.push(config);
  return {
    data: { data: { url: 'https://example.test/image.png' } },
    status: 201, statusText: 'Created', headers: {}, config,
  };
};
const { imagesService } = load('src/service/images.service.ts', {
  './api/axiosClient': axiosModule,
});
await imagesService.upload(new File(['image-bytes'], 'test.png', { type: 'image/png' }), 'general/test');
assert.ok(requests[0].data instanceof FormData);
assert.equal(await requests[0].data.get('file').text(), 'image-bytes');
assert.equal(requests[0].data.get('path'), 'general/test');
await axiosClient.post('/json-endpoint', { status: 'READY' });
assert.equal(requests[1].headers.getContentType(), 'application/json');
assert.equal(JSON.parse(requests[1].data).status, 'READY');
console.log('PASS: uploads retain file bytes; ordinary requests remain JSON');

const { orderService, OrderStatus } = load('src/service/order.service.ts', {
  './api/axiosClient': axiosModule,
});
const firstPage = Array.from({ length: 100 }, (_, index) => ({
  id: `order-${index}`, restaurantId: 'restaurant', status: OrderStatus.READY,
}));
const missedOrder = { id: 'old-pending', restaurantId: 'restaurant', status: OrderStatus.PENDING };
const offsets = [];
const signal = new AbortController().signal;
axiosClient.defaults.adapter = async (config) => {
  offsets.push(config.params.offset);
  assert.equal(config.params.activeOnly, true);
  assert.equal(config.signal, signal);
  return {
    data: { data: config.params.offset === 0 ? firstPage : [missedOrder] },
    status: 200, statusText: 'OK', headers: {}, config,
  };
};
const orders = await orderService.getByRestaurant('restaurant', undefined, signal);
assert.equal(orders.length, 101);
assert.ok(orders.some((order) => order.id === missedOrder.id));
assert.deepEqual(offsets, [0, 100]);
console.log('PASS: pending orders past the first 100 records are retrieved');

const queryClient = load('src/config/query.client.config.ts').default;
const { queryKeys } = load('src/config/query.keys.ts');
const orderModule = load('src/service/order.service.ts', { './api/axiosClient': axiosModule });
const { syncOrderInCache } = load('src/utils/order.cache.utils.ts', {
  '../config/query.keys': { queryKeys },
  '../service/order.service': orderModule,
});
queryClient.setQueryData(queryKeys.orders.list('restaurant'), orders);
syncOrderInCache(queryClient, 'restaurant', { ...missedOrder, status: OrderStatus.CANCELLED });
assert.equal(queryClient.getQueryData(queryKeys.orders.list('restaurant')).length, 100);
assert.equal(queryClient.getQueryData(queryKeys.orders.detail('restaurant', missedOrder.id)).status, OrderStatus.CANCELLED);
console.log('PASS: completed orders leave active lists while their detail stays current');

const listeners = new Map();
let timer;
let disconnected = 0;
let retries = 0;
const socket = {
  active: true,
  connected: true,
  on: (event, callback) => listeners.set(event, callback),
  removeAllListeners: () => listeners.clear(),
  disconnect: () => { disconnected++; },
  connect: () => { retries++; },
  timeout: () => ({ emit: (_event, _restaurant, callback) => callback(null, { joined: true }) }),
};
const { useSocketStore } = load('src/store/socket.store.ts', {
  'socket.io-client': { io: () => socket },
  './auth.store': { useAuthStore: { getState: () => ({ accessToken: 'token', isAuthenticated: true }) } },
  '../config/auth.config': { isAccessTokenExpired: () => false },
  '../config/query.client.config': { default: queryClient, __esModule: true },
  '../config/query.keys': { queryKeys },
}, {
  setTimeout: (callback) => { timer = callback; return 1; },
  clearTimeout: () => { timer = undefined; },
});
useSocketStore.getState().connect('restaurant');
listeners.get('connect')();
assert.equal(useSocketStore.getState().isConnected, true);
listeners.get('connect_error')();
assert.equal(disconnected, 0);
assert.ok(listeners.has('newOrder'));
socket.active = false;
listeners.get('connect_error')();
timer();
assert.equal(retries, 1);
useSocketStore.getState().disconnect();
assert.equal(timer, undefined);
console.log('PASS: transient errors retain notification listeners; explicit disconnect cancels retries');

const { useAppStore } = load('src/store/app.store.ts');
const { useAuthStore } = load('src/store/auth.store.ts', {
  '../config/auth.config': { decodeExp: () => 9999999999 },
  './socket.store': { useSocketStore },
  './app.store': { useAppStore },
  '../config/query.client.config': { default: queryClient, __esModule: true },
});
useAuthStore.getState().setCredentials({ id: 'old-user' }, 'token', 'refresh');
useAppStore.getState().setActiveRestaurant({ id: 'old-restaurant' });
queryClient.setQueryData(['roles'], [{ name: 'restaurant_admin' }]);
queryClient.setQueryData(['restaurants', 'all'], [{ id: 'old-restaurant' }]);
useAuthStore.getState().logout();
useAuthStore.getState().setCredentials({ id: 'new-user' }, 'token', 'refresh');
assert.equal(queryClient.getQueryCache().getAll().length, 0);
assert.equal(useAppStore.getState().activeRestaurant, null);
console.log('PASS: switching accounts clears cached data and restaurant context');

let finishRefresh;
const axios = require('axios');
const { refreshTokens } = load('src/service/api/axiosClient.ts', {
  axios: {
    default: {
      create: (...args) => axios.create(...args),
      post: () => new Promise((resolve) => { finishRefresh = resolve; }),
    },
    __esModule: true,
  },
  '../../data/models/api/api.types': apiTypes,
  '../../store/auth.store': { useAuthStore },
  '../../config/auth.config': { isAccessTokenExpired: () => true },
});
const oldRefresh = refreshTokens();
useAuthStore.getState().logout();
useAuthStore.getState().setCredentials({ id: 'latest-user' }, 'latest-token', 'latest-refresh');
finishRefresh({ data: { data: { accessToken: 'stale-token', refreshToken: 'stale-refresh' } } });
await assert.rejects(oldRefresh, /Session changed/);
assert.equal(useAuthStore.getState().user.id, 'latest-user');
assert.equal(useAuthStore.getState().accessToken, 'latest-token');
console.log('PASS: late token refresh cannot restore a previous account or log out the new user');

const { isValidPreparationTime, initialPreparationTime } = load('src/config/preparation-time.config.ts');
for (const invalid of [0, 4, 5.5, 241, NaN]) assert.equal(isValidPreparationTime(invalid), false);
for (const valid of [5, 20, 240]) assert.equal(isValidPreparationTime(valid), true);
assert.equal(initialPreparationTime(0), 5);
assert.equal(initialPreparationTime(300), 240);
console.log('PASS: preparation times match backend bounds and normalize historical defaults');
queryClient.clear();
