export interface TenorModel {
  id: string;
  name: string;
  duration_day: number | null;
  duration_month: number | null;
  interest_rate: number;
  status: string;
  created_by: string;
}
