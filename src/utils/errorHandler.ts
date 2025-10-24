// src/utils/errorHandler.ts
// 汎用エラーハンドリング機能を提供

import type { PostgrestError } from '@supabase/supabase-js'
import { logger } from './logger'
import { DB_ERROR_MESSAGES, GENERAL_ERROR_MESSAGES } from '../constants/errorMessages'

/**
 * Supabaseのデータベースエラーを日本語メッセージに変換
 */
export function handleDatabaseError(error: PostgrestError | Error): string {
  logger.error('Database error:', error)

  // PostgrestErrorの場合
  if ('code' in error) {
    const dbError = error as PostgrestError
    
    switch (dbError.code) {
      case '23505': // unique_violation
        return DB_ERROR_MESSAGES.DUPLICATE
      case '23514': // check_violation
        return DB_ERROR_MESSAGES.CONSTRAINT_VIOLATION
      case 'PGRST116': // not found
        return DB_ERROR_MESSAGES.NOT_FOUND
      default:
        logger.error('Unknown database error code:', dbError.code)
        return DB_ERROR_MESSAGES.FETCH_FAILED
    }
  }

  // 一般的なErrorの場合
  return GENERAL_ERROR_MESSAGES.UNEXPECTED_ERROR
}

/**
 * 非同期処理のエラーハンドリングをラップするユーティリティ
 * try-catchを簡潔に記述できる
 * 
 * @example
 * const { data, error } = await handleAsyncError(
 *   async () => await supabase.from('schools').select(),
 *   SCHOOL_ERROR_MESSAGES.FETCH_FAILED
 * )
 */
export async function handleAsyncError<T>(
  fn: () => Promise<T>,
  errorMessage: string
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await fn()
    return { data, error: null }
  } catch (err) {
    logger.error('Async error:', err)
    
    // PostgrestErrorまたはErrorの場合は詳細なエラーメッセージを取得
    if (err instanceof Error) {
      const detailedError = handleDatabaseError(err)
      return { data: null, error: detailedError }
    }
    
    // その他の場合は指定されたエラーメッセージを返す
    return { data: null, error: errorMessage }
  }
}

/**
 * エラーオブジェクトから表示用のメッセージを取得
 */
export function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error) {
    return handleDatabaseError(error)
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return fallbackMessage
}