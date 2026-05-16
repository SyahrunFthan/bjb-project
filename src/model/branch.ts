import { District, ProvinceModel, Regency, SubDistrict } from './areas';

export interface BranchModel {
  id: string;
  province_id: string;
  regency_id: string;
  district_id: string;
  sub_district_id: string;
  code: string;
  name: string;
  address: string;
  created_by: string;
  updated_by: string;
  createdAt: string;
  updatedAt: string;
}

export interface Branch extends BranchModel {
  province?: ProvinceModel;
  regency?: Regency;
  district?: District;
  sub_district?: SubDistrict;
}
