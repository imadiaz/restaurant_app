
export const Routes = {
  Login: '/login',
  Dashboard: '/',
  Restaurants: '/restaurants',
  RestaurantAdd: '/restaurants/add',
  RestaurantEdit:(id: string) => `/restaurants/edit/${id}`,
  Users: '/users',
  UserAdd: '/users/add',
  UserEdit: (id: string) => `/users/edit/${id}`,
};