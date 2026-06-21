import { User } from './user';

export interface DashboardStats {
  totalCustomers: number;
  activeLoansCount: number;
  totalDailyBillPaid: number;
  totalDailyBillUnpaid: number;
}

export interface RecentPayment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  customerName: string;
}

export interface CourierDashboard {
  stats: DashboardStats;
  recentPayments: RecentPayment[];
}

export interface CourierDashboardResponse {
  success: boolean;
  message: string;
  data: CourierDashboard;
}

export interface CustomerDashboardStats {
  totalActiveLoan: number;
  totalRemainingAmount: number;
}

export interface CustomerDashboardNextInstallment {
  dueDate: string | null;
  amount: number;
}

export interface CustomerDashboardProgress {
  paidInstallmentsCount: number;
  totalInstallmentsCount: number;
  progressPercentage: number;
  progressMessage: string;
}

export interface CustomerDashboardTransaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  status: string;
}

export interface CustomerDashboardData {
  user?: User;
  customer: {
    full_name: string;
    status: string;
  };
  stats: CustomerDashboardStats;
  nextInstallment: CustomerDashboardNextInstallment;
  progress: CustomerDashboardProgress;
  recentTransactions: CustomerDashboardTransaction[];
}

export interface CustomerDashboardResponse {
  success: boolean;
  message: string;
  data: CustomerDashboardData;
}

