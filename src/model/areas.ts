export interface ProvinceModel {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegencyModel {
  id: string;
  province_id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Regency extends RegencyModel {
  province?: ProvinceModel;
}

export interface DistrictModel {
  id: string;
  regency_id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface District extends DistrictModel {
  regency?: Regency;
}

export interface SubDistrictModel {
  id: string;
  district_id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubDistrict extends SubDistrictModel {
  district?: District;
}
