export interface AppVersionResponse {
  has_update: boolean;
  force_update: boolean;
  latest_version_name: string;
  latest_version_code: number;
  min_version_code: number;
  update_url: string;
  title: string;
  message: string;
  release_notes: string[];
}
