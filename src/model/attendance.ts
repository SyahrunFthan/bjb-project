export interface BranchWorkInfo {
  id: string;
  name: string;
  work_start_time: string;
  work_end_time: string;
  grace_period_minutes: number;
}

export interface ActiveLeaveInfo {
  id: string;
  type: string;
  reason: string;
  start_date: string;
  end_date: string;
}

export interface AttendanceRecord {
  id: string;
  status: 'present' | 'late' | 'absent' | 'on_leave' | 'permit' | 'sick';
  clock_in_at?: string | null;
  clock_in_photo?: string | null;
  clock_out_at?: string | null;
  clock_out_photo?: string | null;
  similarity_score?: number | null;
  notes?: string | null;
  attendance_date?: string;
  leave_request?: ActiveLeaveInfo | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TodayAttendanceResponse {
  today_date: string;
  is_face_registered: boolean;
  can_update_face?: boolean;
  branch: BranchWorkInfo | null;
  active_leave: ActiveLeaveInfo | null;
  attendance: AttendanceRecord | null;
}

export interface AttendanceHistoryResponse {
  month: number;
  year: number;
  attendances: AttendanceRecord[];
}
