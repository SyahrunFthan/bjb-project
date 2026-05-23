import api from '@/lib/api';
import { Option } from '@/types/global';

export const fetchBranchesOptions = async (query: string): Promise<Option[]> => {
  const params = new URLSearchParams();
  if (query.trim().length > 0) {
    params.set('query', query);
  }
  params.set('page_size', '100');
  const response = await api.get(`/branches?${params.toString()}`);
  const branchList = response.data?.data || [];
  return branchList.map((b: any) => ({
    label: b.name,
    value: b.id,
  }));
};
