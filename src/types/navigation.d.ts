import { Customer } from '@/model/customer';
import { Loan } from '@/model/loan';

export type CustomerRouteParamList = {
  Dashboard: undefined;
  History: undefined;
  Profile: undefined;
};

export type CourierRouteParamList = {
  Dashboard: undefined;
  CourierLoan: undefined;
  CustomerCourier: undefined;
  Profile: undefined;
  Monitoring: undefined;
};

export type RouteParamList = {
  Splash: undefined;
  Maintenance: undefined;
  Start: undefined;
  Auth: undefined;
  Customer: undefined;
  Courier: undefined;
  CustomerCreate: undefined;
  Boarding: undefined;
  CustomerEdit: {
    customer: Customer;
  };
  CourierLoanCreate: undefined;
  CourierLoanEdit: {
    loan: Loan;
  };
  CourierCollection: undefined;
  CourierCollectionDetail: {
    loanId: string;
  };
  Terms: undefined;
  Help: undefined;
  DeleteAccount: undefined;
  Secure: undefined;
  Personal: undefined;
  CourierProfile: undefined;
  Notification: undefined;
  LoanItem: {
    loanId: string;
  };
  PaymentReceipt: {
    paymentId: string;
  };
  Activity: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RouteParamList {}
  }
}
