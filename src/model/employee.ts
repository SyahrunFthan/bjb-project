import { UserModel } from './user';

export interface EmployeeModel {
  id: string;
  user_id?: string;
  employee_id: string;
  email: string;
  phone_number: string;
  full_name: string;
  place_of_birth: string;
  date_of_birth: string;
  gender: string;
  religion: string;
  created_by: string;
  updated_by: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee extends EmployeeModel {
  user?: UserModel;
}
