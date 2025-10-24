// src/types/task.ts
// タスク関連の型定義

// タスク
export interface Task {
  id: string;
  exam_info_id: string;
  task_type: 'application' | 'fee_payment' | 'announcement' | 'enrollment' | 'admission_fee';
  assigned_to: string | null;
  assigned_username: string | null;
  is_completed: boolean;
  completed_at: string | null;
}

// 受験タスク情報
export interface ExamTaskInfo {
  id: string;
  school_id: string;
  school_code: string;
  school_name: string;
  exam_candidate_sign: string | null;
  exam_start: string;
  exam_end: string;
  exam_venue: string;
  exam_subjects: string;
  application_start: string | null;
  application_end: string | null;
  application_deadline: string | null;
  application_materials: string | null;
  fee_deadline: string | null;
  announcement_time: string | null;
  enrollment_start: string | null;
  enrollment_end: string | null;
  admission_fee_deadline: string | null;
  tasks: Task[];
}