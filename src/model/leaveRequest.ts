export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

export interface LeaveRequest {
  id: string;
  employee_id: string;
  type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  attachment_url?: string | null;
  replacement_employee_id?: string | null;
  status: LeaveStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_note?: string | null;
  createdAt?: string;
  updatedAt?: string;

  replacement_employee?: {
    id: string;
    full_name: string;
    employee_id: string;
    phone_number?: string;
  };
  employee?: {
    id: string;
    full_name: string;
    employee_id: string;
  };
}

export interface Colleague {
  id: string;
  full_name: string;
  employee_id: string;
}
