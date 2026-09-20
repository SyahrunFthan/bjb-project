import { Customer } from './customer';
import { Payment } from './payment';
import { TenorModel } from './tenor';

export interface Tenor {
  id: string;
  name: string;
  duration_day: number | null;
  duration_month: number | null;
  interest_rate: number;
  status: string;
  created_by: string;
}

export interface RequirementDocument {
  id: string;
  name: string;
  document_type: 'pdf' | 'image' | 'all';
  rank: number;
  is_required: boolean;
  created_by: string;
}

export interface CustomerDocument {
  id: string;
  requirement_document_id: string;
  customer_id: string;
  file_name: string;
  file_path: string;
  created_by: string;
  requirement_document?: RequirementDocument;
}

export interface InstallmentModel {
  id: string;
  loan_id: string;
  invoice_number: string;
  sequence_number: number;
  amount: number;
  paid_amount?: number;
  due_date: string;
  status: 'unpaid' | 'paid' | 'overdue' | 'partially_paid';
}

export interface Installment extends InstallmentModel {
  loan: Loan;
  payments: Payment[];
}

export interface LoanModel {
  id: string;
  customer_id: string;
  employee_id: string;
  tenor_id: string;
  loan_sequence_number: number;
  amount: number;
  interest_rate: number;
  total_amount: number;
  installment_amount: number;
  remaining_amount: number;
  savings_balance?: number;
  submission_status: 'draft' | 'pending' | 'approved' | 'rejected';
  loan_status: 'active' | 'closed' | 'done';
  start_date: string;
  end_date: string;
  createdAt: string;
}

export interface Loan extends LoanModel {
  customer?: Customer;
  tenor?: TenorModel;
  installments?: Installment[];
  is_delegated?: boolean;
  original_employee?: {
    id: string;
    full_name: string;
    employee_id: string;
  } | null;
}

export interface CustomerMonitoringItem {
  loan_id: string;
  loan_sequence_number: number;
  customer: {
    id: string;
    full_name: string;
    member_number: string;
    phone_number: string;
  };
  remaining_amount: number;
  total_amount: number;
  installment_amount: number;
  loan_status: string;
  today_status: {
    is_paid: boolean;
    paid_amount: number;
    target_amount: number;
    due_date: string;
    installment_number: number | null;
    installment_status: string;
  };
  month_progress: {
    month: string;
    days_paid: number;
    total_days: number;
    total_paid: number;
    target_amount: number;
  };
  overall_progress: {
    paid_installments: number;
    total_installments: number;
    percentage: number;
  };
}

export interface MonitoringSummary {
  total_customers: number;
  paid_today_count: number;
  unpaid_today_count: number;
  total_collected_today: number;
  total_target_today: number;
  total_remaining_receivable: number;
}

