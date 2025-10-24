// src/hooks/useSupabaseQuery.ts
// Supabaseからのデータ取得を簡潔に記述するための汎用フック

import { useState, useEffect } from 'react'
import { logger } from '../utils/logger'
import { getErrorMessage } from '../utils/errorHandler'

interface UseSupabaseQueryOptions<T> {
  queryFn: () => Promise<T>
  enabled?: boolean
  errorMessage?: string
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
}

interface UseSupabaseQueryReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Supabaseからのデータ取得を簡潔に記述するための汎用フック
 * 
 * @example
 * const { data, loading, error, refetch } = useSupabaseQuery({
 *   queryFn: async () => {
 *     const { data, error } = await supabase
 *       .from('schools')
 *       .select('*')
 *       .eq('id', schoolId)
 *       .single()
 *     if (error) throw error
 *     return data
 *   },
 *   enabled: !!schoolId,
 *   errorMessage: '学校情報の取得に失敗しました'
 * })
 */
export function useSupabaseQuery<T>({
  queryFn,
  enabled = true,
  errorMessage = 'データの取得に失敗しました',
  onSuccess,
  onError
}: UseSupabaseQueryOptions<T>): UseSupabaseQueryReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const result = await queryFn()
      setData(result)
      
      if (onSuccess) {
        onSuccess(result)
      }
    } catch (err) {
      const errMsg = getErrorMessage(err, errorMessage)
      logger.error('useSupabaseQuery error:', err)
      setError(errMsg)
      
      if (onError) {
        onError(errMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [enabled])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}