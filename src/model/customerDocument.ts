import { RequirementDocument } from './requirementDocument';

export interface CustomerDocumentModel {
  id: string;
  requirement_document_id: string;
  customer_id: string;
  file_name: string;
  file_path: string;
  created_by: string;
}

export interface CustomerDocument extends CustomerDocumentModel {
  requirement_document?: RequirementDocument;
}
