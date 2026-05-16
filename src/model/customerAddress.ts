import { District, ProvinceModel, Regency, SubDistrict } from './areas';
import { Customer } from './customer';

export interface CustomerAddressModel {
  id: string;
  customer_id: string;
  province_id: string;
  regency_id: string;
  district_id: string;
  sub_district_id: string;
  neighborhood_unit?: string;
  community_unit?: string;
  address: string;
  post_number?: string;
  created_by: string;
  updated_by: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAddress extends CustomerAddressModel {
  province?: ProvinceModel;
  regency?: Regency;
  district?: District;
  sub_district?: SubDistrict;
  customer?: Customer;
}
