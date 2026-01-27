
export const Routes = {
  Login: '/login',
  Dashboard: '/',
  Users: '/users',
  UserAdd: '/users/add',
  UserEdit: (id: string) => `/users/edit/${id}`,
};