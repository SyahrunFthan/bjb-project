import { InstallmentModel } from './loan';

export interface PaymentModel {
  id: string;
  installment_id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  collected_by: string;
  receipt_url: string;
  payment_date: Date;
  created_by: string;
  updated_by: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Payment extends PaymentModel {
  installment?: InstallmentModel;
}
