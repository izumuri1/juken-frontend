// src/types/school.ts
// 学校関連の型定義

// 学校マスタ（検索用）
export interface SchoolMaster {
  school_code: string;
  name: string;
  prefecture: string;
  address: string;
}

// 学校基本情報
export interface SchoolInfo {
  id: string;
  school_code: string;
  name: string;
  prefecture: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

// 学校詳細情報（ユーザー入力）
export interface SchoolDetails {
  id: string;
  has_cafeteria: boolean | null;
  has_uniform: boolean | null;
  commute_route: string;
  commute_time: number | null;
  nearest_station: string;
  official_website: string;
}

// Home画面用の学校情報（志望校一覧用）
export interface SchoolListItem {
  id: string;
  schoolId: string;
  schoolCode: string;
  name: string;
  desireLevel: number;
  desireLevelParent: number;
  commuteTime: number;
  nearestStation: string;
  updatedAt: string;
}