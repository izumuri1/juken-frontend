// src/types/exam.ts
// 受験関連の型定義

// 受験情報（完全版）
export interface ExamInfo {
  id: string;
  workspace_id: string;
  school_id: string;
  deviation_value: number;
  judgment_date: string | null;
  judgment_result: string | null;
  exam_candidate_sign: string | null;
  application_start: string | null;
  application_end: string | null;
  application_deadline: string | null;
  application_method: string | null;
  application_materials: string | null;
  application_note: string | null;
  fee_deadline: string | null;
  fee_payment_method: string | null;
  fee_amount: number | null;
  fee_note: string | null;
  exam_start: string;
  exam_end: string;
  exam_venue: string;
  exam_subjects: string;
  parent_waiting_area: string | null;
  exam_note: string | null;
  announcement_time: string | null;
  announcement_method: string | null;
  announcement_note: string | null;
  enrollment_start: string | null;
  enrollment_end: string | null;
  enrollment_method: string | null;
  enrollment_note: string | null;
  admission_fee_deadline: string | null;
  admission_fee_payment_method: string | null;
  admission_fee_amount: number | null;
  admission_fee_note: string | null;
  created_at: string;
  updated_at: string;
}

// Home画面用の受験情報（受験一覧用）
export interface ExamListItem {
  id: string;
  school_id: string;
  schoolName: string;
  desireLevel: number;
  examDate: string;
  examTime: string;
  examStart: string;
  deviationValue: number;
  updatedAt: string;
}