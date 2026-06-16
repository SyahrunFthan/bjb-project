import { Customer } from './customer';
import { Employee } from './employee';

export interface UserModel {
  id: string;
  phone_number: string;
  full_name: string;
  email: string;
  status: string;
  role_level: number;
  registration_at?: string;
  email_verified_at?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends UserModel {
  employee?: Employee;
  customer?: Customer;
}
