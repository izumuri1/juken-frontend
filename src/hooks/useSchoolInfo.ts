// src/hooks/useSchoolInfo.ts
// 学校情報と詳細情報を取得するフック

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger'
import type { SchoolInfo, SchoolDetails } from '../types/school'
import { SCHOOL_ERROR_MESSAGES } from '../constants/errorMessages'

interface UseSchoolInfoOptions {
  schoolCode?: string
  schoolId?: string
  workspaceId?: string
}

interface UseSchoolInfoReturn {
  school: SchoolInfo | null
  schoolDetails: SchoolDetails | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * 学校情報と詳細情報を取得するフック
 * 
 * @example
 * // 学校コードから取得
 * const { school, schoolDetails, loading, error } = useSchoolInfo({
 *   schoolCode: 'A123456',
 *   workspaceId: 'workspace-id'
 * })
 * 
 * @example
 * // 学校IDから取得
 * const { school, schoolDetails, loading, error } = useSchoolInfo({
 *   schoolId: 'school-uuid',
 *   workspaceId: 'workspace-id'
 * })
 */
export function useSchoolInfo({
  schoolCode,
  schoolId,
  workspaceId
}: UseSchoolInfoOptions): UseSchoolInfoReturn {
  const [school, setSchool] = useState<SchoolInfo | null>(null)
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSchoolInfo = async () => {
    if (!schoolCode && !schoolId) {
      logger.log('学校コードまたは学校IDが未設定のためスキップ')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 1. 学校基本情報を取得
      let schoolQuery = supabase
        .from('schools')
        .select('id, school_code, name, prefecture, address, latitude, longitude')

      if (schoolCode) {
        schoolQuery = schoolQuery.eq('school_code', schoolCode)
      } else if (schoolId) {
        schoolQuery = schoolQuery.eq('id', schoolId)
      }

      const { data: schoolData, error: schoolError } = await schoolQuery.single()

      if (schoolError) {
        logger.error('学校情報取得エラー:', schoolError)
        throw schoolError
      }

      if (!schoolData) {
        throw new Error(SCHOOL_ERROR_MESSAGES.NOT_FOUND)
      }

      setSchool(schoolData)
      logger.log('学校情報取得成功:', schoolData)

      // 2. 学校詳細情報を取得（workspaceIdがある場合のみ）
      if (workspaceId && schoolData.id) {
        const { data: detailsData, error: detailsError } = await supabase
          .from('school_details')
          .select('*')
          .eq('workspace_id', workspaceId)
          .eq('school_id', schoolData.id)
          .maybeSingle()

        if (detailsError && detailsError.code !== 'PGRST116') {
          logger.error('学校詳細情報取得エラー:', detailsError)
          // 詳細情報がない場合はエラーにしない
        }

        setSchoolDetails(detailsData)
        logger.log('学校詳細情報取得成功:', detailsData)
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : SCHOOL_ERROR_MESSAGES.FETCH_FAILED
      logger.error('学校情報取得エラー:', err)
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchoolInfo()
  }, [schoolCode, schoolId, workspaceId])

  return {
    school,
    schoolDetails,
    loading,
    error,
    refetch: fetchSchoolInfo
  }
}