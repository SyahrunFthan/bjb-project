export interface CustomerJob {
  id?: string;
  customer_id?: string;
  company_name: string;
  position: string;
  salary: number;
  address: string;
  created_by?: string;
  updated_by?: string;
  createdAt?: string;
  updatedAt?: string;
}
