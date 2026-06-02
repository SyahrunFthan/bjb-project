export interface RequirementDocument {
  id: string;
  name: string;
  document_type: 'pdf' | 'image' | 'all';
  rank: number;
  is_required: boolean;
  created_by: string;
}
