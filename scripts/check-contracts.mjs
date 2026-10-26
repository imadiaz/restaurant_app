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
      jsx: ts.JsxEmit.ReactJSX,
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
const cursors = [];
const signal = new AbortController().signal;
axiosClient.defaults.adapter = async (config) => {
  cursors.push(config.params.cursorId);
  assert.equal(config.params.activeOnly, true);
  assert.equal(config.signal, signal);
  return {
    data: { data: config.params.cursorId === undefined ? firstPage : [missedOrder] },
    status: 200, statusText: 'OK', headers: {}, config,
  };
};
const orders = await orderService.getByRestaurant('restaurant', undefined, signal);
assert.equal(orders.length, 101);
assert.ok(orders.some((order) => order.id === missedOrder.id));
assert.deepEqual(cursors, [undefined, 'order-99']);
console.log('PASS: pending orders past the first 100 records are retrieved');

const pagedRows = Array.from({ length: 101 }, (_, index) => ({ id: `order-${index}`, restaurantId: 'restaurant', status: OrderStatus.PENDING }));
let listCalls = 0;
axiosClient.defaults.adapter = async (config) => {
  listCalls++;
  const cursorIndex = config.params.cursorId ? pagedRows.findIndex((order) => order.id === config.params.cursorId) : -1;
  // The first row left the active set between requests. Its removal must not shift a numeric offset.
  const activeRows = pagedRows.filter((_, index) => index > cursorIndex && !(listCalls > 1 && index === 0));
  return { data: { data: activeRows.slice(0, config.params.limit) }, status: 200, statusText: 'OK', headers: {}, config };
};
const changingOrders = await orderService.getByRestaurant('restaurant', undefined, signal);
assert.ok(changingOrders.some((order) => order.id === 'order-100'));
assert.equal(new Set(changingOrders.map((order) => order.id)).size, changingOrders.length);
console.log('PASS: an order leaving the active set between pages cannot hide an older pending order');

const historicalPage = {
  items: [{ id: 'cancelled-order', restaurantId: 'restaurant', status: OrderStatus.CANCELLED }],
  total: 41, page: 3, pageSize: 20, totalPages: 3,
};
axiosClient.defaults.adapter = async (config) => {
  assert.equal(config.url, '/orders/restaurant/restaurant/history');
  assert.equal(config.signal, signal);
  assert.deepEqual({ ...config.params }, { search: 'Ana Pérez', status: 'CANCELLED', page: 3, limit: 20 });
  return { data: { data: historicalPage }, status: 200, statusText: 'OK', headers: {}, config };
};
assert.deepEqual(await orderService.getHistory('restaurant', { search: 'Ana Pérez', status: OrderStatus.CANCELLED, page: 3, pageSize: 20 }, signal), historicalPage);
console.log('PASS: history sends search, status and pagination to the dedicated endpoint and preserves page metadata');

const queryClient = load('src/config/query.client.config.ts').default;
const { queryKeys } = load('src/config/query.keys.ts');
const orderModule = load('src/service/order.service.ts', { './api/axiosClient': axiosModule });
const actions = load('src/utils/order.actions.ts', {
  '../service/order.service': orderModule,
});
for (const status of [OrderStatus.PENDING, OrderStatus.CONFIRMED]) {
  assert.equal(actions.canCancelBeforePreparation({ status }), true);
}
for (const status of [OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.ON_WAY, OrderStatus.DELIVERED]) {
  assert.equal(actions.canCancelBeforePreparation({ status }), false);
}
assert.equal(actions.requiresOnlineRefund({ paymentMethod: 'CARD', paymentStatus: 'PAID' }), true);
assert.equal(actions.requiresOnlineRefund({ paymentMethod: 'CARD_TERMINAL', paymentStatus: 'PAID' }), false);
const fullId = 'f0829fc6-1234-4321-8888-123456789012';
assert.equal(actions.shortOrderId(fullId), 'F0829F');
assert.equal(fullId.length, 36);
console.log('PASS: cancellation stops at preparation; online refunds and short order IDs match the contract');
for (const type of ['PICKUP', 'DELIVERY']) {
  for (const status of Object.values(OrderStatus)) {
    assert.equal(actions.canCompletePickup({ type, status }), type === 'PICKUP' && status === 'READY');
  }
}
const pickupUtils = load('src/utils/pickup.utils.ts');
assert.equal(pickupUtils.normalizePickupCode(' abc234 '), 'ABC234');
assert.equal(pickupUtils.isValidPickupCode(' abc234 '), true);
for (const value of ['', 'ABC23', 'ABC2345', 'O0IL12']) assert.equal(pickupUtils.isValidPickupCode(value), false);
assert.equal(pickupUtils.formatPickupSchedule(null, 'es-MX'), null);
assert.equal(pickupUtils.formatPickupSchedule('invalid', 'es-MX'), null);
const pickupDate = '2026-10-23T17:00:00.000Z';
assert.equal(pickupUtils.formatPickupSchedule(pickupDate, 'es-MX'), new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(pickupDate)));
axiosClient.defaults.adapter = async (config) => {
  assert.equal(config.method, 'patch');
  assert.equal(config.url, '/orders/pickup-order/pickup/complete');
  assert.deepEqual(JSON.parse(config.data), { verificationCode: 'ABC234' });
  return { data: { data: { id: 'pickup-order', type: 'PICKUP', status: 'DELIVERED' } }, status: 200, statusText: 'OK', headers: {}, config };
};
assert.equal((await orderService.completePickup('pickup-order', 'ABC234')).status, 'DELIVERED');
console.log('PASS: pickup completion requires READY, validates code format, uses Mexico City schedule and the dedicated verification endpoint');

let copiedId;
let stopped = false;
const copyMessages = [];
const { default: OrderNumber } = load('src/components/common/OrderNumber.tsx', {
  'react-i18next': { useTranslation: () => ({ t: (key) => key }) },
  '../../store/toast.store': { useToastStore: (select) => select({ addToast: (...args) => copyMessages.push(args) }) },
  '../../utils/order.actions': actions,
}, {
  navigator: { clipboard: { writeText: (value) => { copiedId = value; return Promise.resolve(); } } },
});
const copyButton = OrderNumber({ id: fullId });
await copyButton.props.onClick({ stopPropagation: () => { stopped = true; } });
assert.equal(copiedId, fullId);
assert.equal(stopped, true);
assert.equal(copyMessages[0][1], 'success');
console.log('PASS: order number copy handler copies the full UUID without opening the card');
const { syncOrderInCache } = load('src/utils/order.cache.utils.ts', {
  '../config/query.keys': { queryKeys },
  '../service/order.service': orderModule,
});
queryClient.setQueryData(queryKeys.orders.list('restaurant'), orders);
const historyKey = queryKeys.orders.history('restaurant', 'Ana', 'CANCELLED', 2, 20);
const otherHistoryKey = queryKeys.orders.history('other-restaurant', '', 'all', 1, 20);
queryClient.setQueryData(historyKey, historicalPage);
queryClient.setQueryData(otherHistoryKey, historicalPage);
syncOrderInCache(queryClient, 'restaurant', { ...missedOrder, status: OrderStatus.CANCELLED });
assert.equal(queryClient.getQueryData(queryKeys.orders.list('restaurant')).length, 100);
assert.equal(queryClient.getQueryData(queryKeys.orders.detail('restaurant', missedOrder.id)).status, OrderStatus.CANCELLED);
assert.equal(queryClient.getQueryState(historyKey).isInvalidated, true);
assert.equal(queryClient.getQueryState(otherHistoryKey).isInvalidated, false);
assert.deepEqual(queryClient.getQueryData(historyKey), historicalPage);
assert.notDeepEqual(historyKey, queryKeys.orders.history('restaurant', 'Ana', 'DELIVERED', 2, 20));
assert.notDeepEqual(historyKey, queryKeys.orders.history('restaurant', 'Ana', 'CANCELLED', 1, 20));
assert.notDeepEqual(historyKey, queryKeys.orders.history('restaurant', 'Luis', 'CANCELLED', 2, 20));
console.log('PASS: completed orders leave active lists while their detail stays current');
console.log('PASS: history filters/pages have separate caches and order events invalidate only their restaurant history');

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

const statisticsUtils = load('src/utils/statistics.utils.ts');
assert.equal(statisticsUtils.mexicoCityDate(new Date('2026-10-21T01:00:00Z')), '2026-10-20');
assert.equal(statisticsUtils.validDashboardRange('2026-10-01', '2026-10-21'), true);
assert.equal(statisticsUtils.validDashboardRange('2026-10-21', '2026-10-01'), false);
assert.equal(statisticsUtils.validDashboardRange('2026-02-30', '2026-03-05'), false);
assert.equal(statisticsUtils.validDashboardRange('2025-01-01', '2026-10-21'), false);
const sevenDays = statisticsUtils.dashboardDateRange('7');
assert.equal((Date.parse(sevenDays.endDate) - Date.parse(sevenDays.startDate)) / 86400000, 6);
const dashboardFixture = {
  summary: { totalRevenue: 300, deliveredOrders: 3, averageTicket: 100 },
  chart: [{ dailyEarnings: 50, ordersCount: 1, averageTicket: 50 }, { dailyEarnings: 250, ordersCount: 2, averageTicket: 125 }],
};
assert.equal(statisticsUtils.dashboardMetric(dashboardFixture, 'ticket').total, 100);
assert.equal(statisticsUtils.dashboardMetric(dashboardFixture, 'orders').values[1], 2);
const statsFilters = { restaurantId: 'restaurant', ...sevenDays, paymentMethod: 'CARD_TERMINAL' };
assert.notDeepEqual(queryKeys.statistics.resource('dashboard', statsFilters), queryKeys.statistics.resource('dashboard', { ...statsFilters, paymentMethod: 'CASH' }));
const statisticsRequests = [];
axiosClient.defaults.adapter = async (config) => {
  statisticsRequests.push(config);
  return { data: { data: config.url.includes('platform-debt') ? { debtAmount: -875 } : dashboardFixture }, status: 200, statusText: 'OK', headers: {}, config };
};
const { statisticsService } = load('src/service/statistics.service.ts', { './api/axiosClient': axiosModule });
await statisticsService.getDashboard(statsFilters, signal);
const debt = await statisticsService.getPlatformDebt('restaurant', signal);
assert.equal(statisticsRequests[0].params.paymentMethod, 'CARD_TERMINAL');
assert.equal(statisticsRequests[0].signal, signal);
assert.equal(statisticsRequests[1].params, undefined);
assert.equal(debt.debtAmount, -875);
console.log('PASS: dashboard dates, metric selection and payment filter keep current debt independent');

// Verify both the real AbortSignal transport and the hook cleanup, without a browser.
const { driverService } = load('src/service/drivers.service.ts', { './api/axiosClient': axiosModule });
let locationSignal;
let abortedLocation = false;
let markLocationStarted;
const locationStarted = new Promise((resolve) => { markLocationStarted = resolve; });
axiosClient.defaults.adapter = (config) => {
  locationSignal = config.signal;
  markLocationStarted();
  return new Promise((resolve, reject) => {
    config.signal.addEventListener('abort', () => {
      abortedLocation = true;
      reject(new axios.CanceledError());
    }, { once: true });
  });
};
let driverQuery;
let closeMap;
const { useDriverLocations } = load('src/hooks/drivers/use.drivers.ts', {
  react: { useEffect: (effect) => { closeMap = effect(); } },
  '@tanstack/react-query': { useQueryClient: () => queryClient, useQuery: (options) => { driverQuery = options; return {}; } },
  '../../service/drivers.service': { driverService },
  '../../store/app.store': { useAppStore },
  '../../store/auth.store': { useAuthStore },
  '../../store/toast.store': {},
  '../use.error.handler': {},
  '../../data/models/user/utils/user.utils': {},
  '../../config/query.keys': { queryKeys },
});
useDriverLocations('restaurant', true);
assert.equal(driverQuery.enabled, true);
assert.equal(driverQuery.refetchInterval, 60000);
const pendingLocations = queryClient.fetchQuery(driverQuery);
const cancelledLocations = assert.rejects(pendingLocations);
await locationStarted;
assert.equal(locationSignal.aborted, false);
closeMap();
await cancelledLocations;
assert.equal(locationSignal.aborted, true);
assert.equal(abortedLocation, true);
useDriverLocations('restaurant', false);
assert.equal(driverQuery.enabled, false);
assert.equal(driverQuery.refetchInterval, false);
console.log('PASS: closing the driver map stops polling and aborts the active HTTP request');

const { paymentService } = load('src/service/payment.service.ts', { './api/axiosClient': axiosModule });
let confirmationRequest;
axiosClient.defaults.adapter = async (config) => {
  confirmationRequest = config;
  return { data: { data: { verified: true, pending: false, restaurantId: 'restaurant', amountPaid: 100 } }, status: 200, statusText: 'OK', headers: {}, config };
};
await paymentService.confirmDebtSession('restaurant', 'cs_test_123', signal);
assert.equal(confirmationRequest.method, 'post');
assert.equal(confirmationRequest.url, '/payments/restaurant/restaurant/platform-debt-session/cs_test_123/confirm');
assert.equal(confirmationRequest.signal, signal);
assert.equal(confirmationRequest.data, undefined); // Never accept a browser-supplied paid amount.
let confirmationQuery;
const invalidatedKeys = [];
let confirmedPayment;
const { useDebtPayment } = load('src/hooks/payments/use.debt.payment.ts', {
  react: { useEffect: (effect) => effect() },
  '@tanstack/react-query': {
    useQueryClient: () => ({ invalidateQueries: ({ queryKey }) => { invalidatedKeys.push(queryKey); } }),
    useQuery: (options) => { confirmationQuery = options; return { data: confirmedPayment }; },
  },
  '../../service/payment.service': { paymentService },
  '../../config/query.keys': { queryKeys },
});
useDebtPayment(null, null, true);
assert.equal(confirmationQuery.enabled, false);
assert.equal(invalidatedKeys.length, 0);
useDebtPayment('restaurant', 'cs_test_123', true);
assert.equal(confirmationQuery.enabled, true);
assert.equal(confirmationQuery.refetchInterval({ state: { data: { pending: true }, dataUpdateCount: 1 } }), 3000);
assert.equal(confirmationQuery.refetchInterval({ state: { data: { pending: true }, dataUpdateCount: 10 } }), false);
assert.equal(confirmationQuery.refetchInterval({ state: { data: { pending: false, verified: true }, dataUpdateCount: 1 } }), false);
confirmedPayment = { verified: true };
useDebtPayment('restaurant', 'cs_test_123', true);
assert.equal(invalidatedKeys[0][0], 'statistics');
assert.equal(invalidatedKeys[1][0], 'restaurants');
console.log('PASS: return-page verification uses the server, bounds polling and refreshes debt only after recording payment');

const { createPendingOrderAlerts } = load('src/utils/pending.order.alerts.ts', { '../service/order.service': orderModule });
const pendingAlerts = createPendingOrderAlerts('restaurant', 'user');
const pendingAlertOrder = { id: 'recovered-order', restaurantId: 'restaurant', status: OrderStatus.PENDING };
assert.equal(pendingAlerts.claim(pendingAlertOrder), true); // HTTP recovery first.
assert.equal(pendingAlerts.claim(pendingAlertOrder), false); // Socket duplicate.
assert.equal(pendingAlerts.claim(pendingAlertOrder), false); // Poll after dismissal.
assert.equal(pendingAlerts.claim({ ...pendingAlertOrder, id: 'foreign', restaurantId: 'other' }), false);
assert.equal(pendingAlerts.claim({ ...pendingAlertOrder, id: 'accepted', status: OrderStatus.CONFIRMED }), false);
pendingAlerts.rememberResolved({ ...pendingAlertOrder, id: 'resolved', status: OrderStatus.CANCELLED });
assert.equal(pendingAlerts.claim({ ...pendingAlertOrder, id: 'resolved' }), false);
pendingAlerts.reset(); // StrictMode teardown must not swallow recovered alerts on replay.
assert.equal(pendingAlerts.claim(pendingAlertOrder), true);

const recoveryEffects = [];
let refIndex = 0;
let recoveryQuery;
let socketOrderEvent;
let soundsPlayed = 0;
const customNotifications = [];
const audio = { play: () => { soundsPlayed++; return Promise.resolve(); }, pause: () => {}, currentTime: 0 };
const hookReact = {
  ...require('react'),
  useCallback: (callback) => callback,
  useMemo: (factory) => factory(),
  useRef: (initial) => ({ current: refIndex++ === 0 ? audio : initial }),
  useEffect: (effect) => recoveryEffects.push(effect),
};
const { default: RecoveryManager } = load('src/components/managers/SocketManager.tsx', {
  react: hookReact,
  '@tanstack/react-query': { useQueryClient: () => queryClient, useQuery: (options) => { recoveryQuery = options; return { data: [pendingAlertOrder] }; } },
  '../../store/socket.store': { useSocketStore: () => ({ connect: (_id, callback) => { socketOrderEvent = callback; }, disconnect: () => {} }) },
  '../../store/app.store': { useAppStore: () => ({ activeRestaurant: { id: 'restaurant' } }) },
  '../../store/auth.store': { useAuthStore: () => ({ isAuthenticated: true, user: { id: 'user', role: { name: 'restaurant_admin' } } }) },
  '../../store/toast.store': { useToastStore: (select) => select({ addToast: () => {}, removeToast: () => {}, addCustomToast: (content) => { customNotifications.push(content); } }) },
  '../common/OrderNotificationToast': { default: () => null, __esModule: true },
  '../../service/order.service': orderModule,
  '../../utils/order.cache.utils': { syncOrderInCache },
  '../../utils/order.actions': actions,
  '../../hooks/use.error.handler': { useErrorHandler: () => ({ handleError: () => {} }) },
  'react-i18next': { useTranslation: () => ({ t: (key) => key }) },
  '../../config/roles': { ROLES: { ADMIN: 'restaurant_admin', SUPER_ADMIN: 'super_admin' } },
  '../../config/query.keys': { queryKeys },
  '../../utils/pending.order.alerts': { createPendingOrderAlerts },
}, { window: { removeEventListener: () => {}, addEventListener: () => {} } });
RecoveryManager();
const recoveryCleanups = recoveryEffects.map((effect) => effect());
assert.equal(recoveryQuery.enabled, true);
assert.equal(recoveryQuery.refetchInterval, 30000);
assert.equal(recoveryQuery.refetchIntervalInBackground, true);
assert.equal(customNotifications.length, 1);
assert.equal(soundsPlayed, 1);
socketOrderEvent(pendingAlertOrder, 'newOrder');
assert.equal(customNotifications.length, 1);
customNotifications[0].props.onClose();
socketOrderEvent(pendingAlertOrder, 'newOrder');
assert.equal(soundsPlayed, 1);
recoveryCleanups.forEach((cleanup) => cleanup?.());
console.log('PASS: global polling recovers audible order alerts and deduplicates socket/poll/dismissal events');

// Modal placement is independent of the list's loading/empty branch. No browser/UI test.
const driversPage = readFileSync('src/pages/drivers/DriversPage.tsx', 'utf8');
assert.ok(driversPage.indexOf('</BasePageLayout>') < driversPage.indexOf('<DriversMapModal'));
assert.ok(driversPage.indexOf('</BasePageLayout>') < driversPage.indexOf('<DriverDetailModal'));
console.log('PASS: driver dialogs are outside the layout branch that hides empty search results');
queryClient.clear();

const importUtils = load('src/utils/product.import.utils.ts');
const importSections = [{ id: 'section-a', name: 'Sushi', status: 'active' }];
const importRow = {
  sourceRow: 2, sourceCategory: 'Sushi', name: 'Roll', description: '', price: 0,
  menuSectionId: 'section-a', prepTimeMin: null, prepTimeMax: null,
  status: 'pending', productId: null, version: 3, duplicateProductId: null,
};
assert.equal(importUtils.importRowIssues(importRow, importSections).length, 0);
assert.ok(importUtils.importRowIssues({ ...importRow, price: null }, importSections).includes('price_error'));
assert.ok(importUtils.importRowIssues({ ...importRow, price: -1 }, importSections).includes('price_error'));
assert.ok(importUtils.importRowIssues({ ...importRow, price: 10.001 }, importSections).includes('price_error'));
assert.ok(importUtils.importRowIssues({ ...importRow, menuSectionId: 'foreign' }, importSections).includes('section_error'));
assert.ok(importUtils.importRowIssues({ ...importRow, prepTimeMin: 20, prepTimeMax: 10 }, importSections).includes('prep_error'));
const importEdit = importUtils.toImportEdit(importRow, { price: null, prepTimeMin: 0, allowDuplicate: true, productId: 'injected' });
assert.equal(importEdit.price, null);
assert.equal(importEdit.prepTimeMin, 0);
assert.equal(importEdit.expectedVersion, 3);
assert.equal(importUtils.toImportEdit({ ...importRow, version: 8 }, { expectedVersion: 3, name: 'Local edit' }).expectedVersion, 3);
assert.equal(importEdit.allowDuplicate, true);
assert.ok(!('productId' in importEdit));
assert.equal(importUtils.hasImportDuplicate(importRow, [importRow, { ...importRow, sourceRow: 3, name: '  Róll ' }]), true);
assert.equal(importUtils.hasImportDuplicate(importRow, [importRow, { ...importRow, sourceRow: 3, name: 'Roll', status: 'skipped' }]), false);
assert.deepEqual([...importUtils.importDuplicateRows([importRow, { ...importRow, sourceRow: 3, name: '  Róll ' }])], [2, 3]);
assert.equal(importUtils.applyImportDraft({ ...importRow, duplicateProductId: 'old-match' }, { name: 'Different roll' }).duplicateProductId, null);
console.log('PASS: Excel import draft validation preserves blanks/zero, checks duplicates, and allowlists idempotent row commits');

const importService = load('src/service/product.import.service.ts', { './api/axiosClient': axiosModule }).productImportService;
axiosClient.defaults.adapter = async (config) => {
  requests.push(config);
  return { data: { data: {} }, status: 200, statusText: 'OK', headers: {}, config };
};
const menuFile = new File(['xlsx-bytes'], 'Menu.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
await importService.upload('restaurant-a', menuFile);
const menuUpload = requests.at(-1);
assert.ok(menuUpload.data instanceof FormData);
assert.equal(await menuUpload.data.get('file').text(), 'xlsx-bytes');
await importService.commit('import-a', importEdit);
assert.equal(requests.at(-1).url, '/product-imports/import-a/rows/2/commit');
assert.equal(JSON.parse(requests.at(-1).data).expectedVersion, 3);
console.log('PASS: Excel file bytes use multipart upload and row saves carry their stable import/row/version');
const importApp = readFileSync('src/App.tsx', 'utf8');
assert.ok(importApp.includes('path="products/import"'));
assert.ok(readFileSync('src/pages/products/ProductsPage.tsx', 'utf8').includes('Routes.ProductImport'));
assert.ok(importApp.includes('path="products/add"'));
console.log('PASS: Excel import has its own route and leaves the ordinary product creation route intact');

const promoService = load('src/service/promotion.service.ts', { './api/axiosClient': axiosModule });
const promoUtils = load('src/utils/promotion.utils.ts', { '../service/promotion.service': promoService });
const promoSections = [{ id: 'sushi', name: 'Sushi', status: 'active' }, { id: 'specials', name: 'Especiales', status: 'active' }, { id: 'paused', status: 'inactive' }];
const promoProducts = [
  { id: 'roll', status: 'active', menuSections: [promoSections[0], promoSections[1]] },
  { id: 'new', status: 'active', menuSections: [promoSections[0]] },
  { id: 'inactive', status: 'inactive', menuSections: [promoSections[0]] },
];
const sectionTargets = promoUtils.promotionTargets('sections', ['roll'], ['sushi', 'specials', 'sushi']);
assert.equal(sectionTargets.scope, 'sections');
assert.deepEqual([...sectionTargets.sectionIds], ['sushi', 'specials']);
assert.ok(!('productIds' in sectionTargets));
const productTargets = promoUtils.promotionTargets('products', ['roll'], ['sushi']);
assert.deepEqual([...productTargets.productIds], ['roll']);
assert.ok(!('sectionIds' in productTargets));
assert.deepEqual([...promoUtils.includedPromotionProducts(promoProducts, promoSections, 'sections', [], ['sushi', 'specials']).map(p => p.id)], ['roll', 'new']);
assert.deepEqual([...promoUtils.includedPromotionProducts(promoProducts, promoSections, 'products', ['roll'], ['sushi']).map(p => p.id)], ['roll']);
const promoForm = { name: 'Promo', description: '', type: 'percentage', value: '20', startDate: '2026-10-24T12:00', endDate: '2026-10-31T23:59', scope: 'sections', sectionIds: ['sushi'], productIds: [] };
assert.equal(Object.keys(promoUtils.validatePromotionForm(promoForm, promoProducts, promoSections)).length, 0);
for (const value of ['', '-1', '101', 'NaN', '10.123']) assert.ok(promoUtils.validatePromotionForm({ ...promoForm, value }, promoProducts, promoSections).value);
assert.ok(!promoUtils.validatePromotionForm({ ...promoForm, type: 'bogo', value: '' }, promoProducts, promoSections).value);
assert.ok(promoUtils.validatePromotionForm({ ...promoForm, sectionIds: [] }, promoProducts, promoSections).targets);
assert.ok(promoUtils.validatePromotionForm({ ...promoForm, sectionIds: ['foreign'] }, promoProducts, promoSections).targets);
assert.ok(promoUtils.validatePromotionForm({ ...promoForm, sectionIds: ['paused'] }, promoProducts, promoSections).targets);
assert.ok(promoUtils.validatePromotionForm({ ...promoForm, endDate: promoForm.startDate }, promoProducts, promoSections).endDate);
assert.ok(promoUtils.validatePromotionForm({ ...promoForm, startDate: 'invalid' }, promoProducts, promoSections).startDate);
assert.ok(promoUtils.validatePromotionForm({ ...promoForm, name: '   ' }, promoProducts, promoSections).name);
assert.ok(promoUtils.validatePromotionForm({ ...promoForm, description: 'x'.repeat(256) }, promoProducts, promoSections).description);
const originalIso = '2026-10-24T18:00:00.000Z';
assert.equal(new Date(promoUtils.promotionDateInput(originalIso)).toISOString(), originalIso);
await promoService.promotionsService.create({ restaurantId: 'restaurant', ...sectionTargets });
assert.equal(requests.at(-1).url, '/promotions');
assert.equal(JSON.parse(requests.at(-1).data).scope, 'sections');
assert.ok(!('productIds' in JSON.parse(requests.at(-1).data)));
await promoService.promotionsService.update('promo', productTargets);
assert.equal(requests.at(-1).url, '/promotions/promo');
assert.deepEqual(JSON.parse(requests.at(-1).data), { scope: 'products', productIds: ['roll'] });
console.log('PASS: promotions keep product/section payloads exclusive, deduplicate previews, validate selections/discounts and round-trip local dates');

// The kitchen needs total quantities across all parent-product units.
assert.equal(actions.orderModifierSummary({ id: 'extra', name: 'Cheese', groupName: 'Extras', price: 12, quantity: 3, totalPrice: 36 }, 2).quantity, 6);
assert.equal(actions.orderModifierSummary({ id: 'extra', name: 'Cheese', groupName: 'Extras', price: 12, quantity: 3, totalPrice: 36 }, 2).total, 72);
assert.equal(actions.orderModifierSummary({ id: 'legacy-extra', name: 'Cheese', groupName: 'Extras', price: 12 }, 2).quantity, 2);
assert.equal(actions.orderModifierSummary({ id: 'legacy-extra', name: 'Cheese', groupName: 'Extras', price: 12 }, 2).total, 24);
console.log('PASS: modifier totals preserve per-product quantities and legacy defaults');
