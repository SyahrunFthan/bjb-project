import { UserModel } from './user';

export interface CustomerModel {
  id: string;
  user_id: string;
  national_id: string;
  full_name: string;
  place_of_birth: string;
  date_of_birth: string;
  gender: string;
  religion: string;
  address: string;
  phone_number: string;
  email: string;
  marital_status: string;
  member_number: string;
  status: string;
  created_by: string;
  updated_by: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer extends CustomerModel {
  user?: UserModel;
}
