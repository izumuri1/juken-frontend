// src/utils/authErrorHandler.ts
// Supabase認証エラーを日本語メッセージに変換

import { AuthError } from '@supabase/supabase-js'
import { AUTH_ERROR_MESSAGES } from '../constants/errorMessages'

export function handleAuthError(error: AuthError | null): string {
  if (!error) return ''
  
  // エラーメッセージに基づいて適切な日本語メッセージを返す
  if (error.message.includes('Invalid login credentials')) {
    return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS
  }
  
  if (error.message.includes('Email not confirmed')) {
    return AUTH_ERROR_MESSAGES.EMAIL_NOT_CONFIRMED
  }
  
  if (error.message.includes('Invalid email')) {
    return AUTH_ERROR_MESSAGES.EMAIL_INVALID
  }
  
  if (error.code === 'user_already_exists') {
    return AUTH_ERROR_MESSAGES.USER_ALREADY_EXISTS
  }
  
  // その他のエラー
  return AUTH_ERROR_MESSAGES.UNEXPECTED_ERROR
}