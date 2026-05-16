export type CustomerRouteParamList = {
  Dashboard: undefined;
  History: undefined;
  Profile: undefined;
};

export type EmployeeRouteParamList = {
  Dashboard: undefined;
  History: undefined;
  Profile: undefined;
};

export type RouteParamList = {
  Splash: undefined;
  Start: undefined;
  Auth: undefined;
  Customer: undefined;
  Employee: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RouteParamList {}
  }
}
