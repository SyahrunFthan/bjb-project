export type CustomerRouteParamList = {
  Dashboard: undefined;
  History: undefined;
  Profile: undefined;
};

export type CourierRouteParamList = {
  Dashboard: undefined;
  Request: undefined;
  CustomerCourier: undefined;
  Profile: undefined;
};

export type RouteParamList = {
  Splash: undefined;
  Start: undefined;
  Auth: undefined;
  Customer: undefined;
  Courier: undefined;
  CustomerCreate: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RouteParamList {}
  }
}
