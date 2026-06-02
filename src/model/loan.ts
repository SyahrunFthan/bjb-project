import { Customer } from './customer';
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

export interface Installment {
  id: string;
  loan_id: string;
  invoice_number: string;
  sequence_number: number;
  amount: number;
  due_date: string;
  status: 'unpaid' | 'paid' | 'overdue';
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
}
