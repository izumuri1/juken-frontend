// src/types/auth.ts
// 認証関連の型定義

export interface LoginFormData {
  email: string
  password: string
}

export interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
  username: string
}

export interface PasswordResetFormData {
  email: string
}

export interface PasswordUpdateFormData {
  password: string
  confirmPassword: string
}