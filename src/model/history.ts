import { TenorModel } from './tenor';

export interface CustomerLoanHistory {
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
  submission_status: string;
  loan_status: string;
  start_date: string | null;
  end_date: string | null;
  created_by: string;
  updated_by: string | null;
  createdAt: string;
  updatedAt: string;
  tenor?: TenorModel;
}

export interface CustomerPaymentHistory {
  id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  payment_date: string;
  installment_sequence: number;
  loan_id: string;
}

export interface CustomerLoansResponse {
  success: boolean;
  message: string;
  data: CustomerLoanHistory[];
}

export interface CustomerPaymentsResponse {
  success: boolean;
  message: string;
  data: CustomerPaymentHistory[];
}
