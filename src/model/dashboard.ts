export interface DashboardStats {
  totalCustomers: number;
  activeLoansCount: number;
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
