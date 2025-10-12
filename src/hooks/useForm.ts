// src/hooks/useForm.ts
import { useState, useCallback } from 'react'

// バリデーション設定の型定義
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => string | undefined
  displayName?: string
}

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule
}

export interface FormOptions<T> {
  initialValues: T
  validationRules?: ValidationRules<T>
}

export interface UseFormReturn<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  hasErrors: boolean

  setValue: (field: keyof T, value: T[keyof T]) => void
  setValues: (newValues: Partial<T>) => void
  setError: (field: keyof T, error: string) => void
  clearError: (field: keyof T) => void
  clearAllErrors: () => void
  validateField: (field: keyof T) => boolean
  validateAll: () => boolean
  reset: () => void
  setSubmitting: (submitting: boolean) => void

  getFieldProps: (field: keyof T) => {
    name: string
    value: string
    onChange: (value: string) => void
    error?: string
  }
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationRules = {}
}: FormOptions<T>): UseFormReturn<T> => {
  const [appv_values, appf_setValuesState] = useState<T>(initialValues)
  const [appv_errors, appf_setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [appv_isSubmitting, appf_setIsSubmitting] = useState(false)

  // 単一フィールドの値を設定
  const appf_setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    appf_setValuesState(prev => ({
      ...prev,
      [field]: value
    }))

    if (appv_errors[field]) {
      appf_setErrors(prev => {
        const appv_newErrors = { ...prev }
        delete appv_newErrors[field]
        return appv_newErrors
      })
    }
  }, [appv_errors])

  // 複数フィールドの値を設定
  const appf_setValues = useCallback((newValues: Partial<T>) => {
    appf_setValuesState(prev => ({ ...prev, ...newValues }))
  }, [])

  // エラーを設定
  const appf_setError = useCallback((field: keyof T, error: string) => {
    appf_setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  // 単一フィールドのエラーをクリア
  const appf_clearError = useCallback((field: keyof T) => {
    appf_setErrors(prev => {
      const appv_newErrors = { ...prev }
      delete appv_newErrors[field]
      return appv_newErrors
    })
  }, [])

  // 全エラーをクリア
  const appf_clearAllErrors = useCallback(() => {
    appf_setErrors({})
  }, [])

  // 単一フィールドのバリデーション
  const appf_validateField = useCallback((field: keyof T): boolean => {
    const appv_rule = validationRules[field]
    if (!appv_rule) return true

    const appv_value = String(appv_values[field] || '')
    const appv_displayName = appv_rule.displayName || String(field)

    // required チェック
    if (appv_rule.required && !appv_value.trim()) {
      appf_setError(field, `${appv_displayName}は必須です`)
      return false
    }

    // minLength チェック
    if (appv_rule.minLength && appv_value.length < appv_rule.minLength) {
      appf_setError(field, `${appv_displayName}は${appv_rule.minLength}文字以上で入力してください`)
      return false
    }

    // maxLength チェック
    if (appv_rule.maxLength && appv_value.length > appv_rule.maxLength) {
      appf_setError(field, `${appv_displayName}は${appv_rule.maxLength}文字以下で入力してください`)
      return false
    }

    // pattern チェック
    if (appv_rule.pattern && !appv_rule.pattern.test(appv_value)) {
      appf_setError(field, `${appv_displayName}の形式が正しくありません`)
      return false
    }

    // custom チェック
    if (appv_rule.custom) {
      const appv_customError = appv_rule.custom(appv_value)
      if (appv_customError) {
        appf_setError(field, appv_customError)
        return false
      }
    }

    appf_clearError(field)
    return true
  }, [appv_values, validationRules, appf_setError, appf_clearError])

  // 全フィールドのバリデーション
  const appf_validateAll = useCallback((): boolean => {
    let appv_isValid = true

    Object.keys(validationRules).forEach(field => {
      if (!appf_validateField(field as keyof T)) {
        appv_isValid = false
      }
    })

    return appv_isValid
  }, [validationRules, appf_validateField])

  // フォームをリセット
  const appf_reset = useCallback(() => {
    appf_setValuesState(initialValues)
    appf_setErrors({})
    appf_setIsSubmitting(false)
  }, [initialValues])

  // 送信状態を設定
  const appf_setSubmitting = useCallback((submitting: boolean) => {
    appf_setIsSubmitting(submitting)
  }, [])

  // フィールドに必要なpropsを生成するヘルパー
  const appf_getFieldProps = useCallback((field: keyof T) => ({
    name: String(field),
    value: String(appv_values[field] || ''),
    onChange: (value: string) => appf_setValue(field, value as T[keyof T]),
    error: appv_errors[field]
  }), [appv_values, appv_errors, appf_setValue])

  const appv_hasErrors = Object.keys(appv_errors).length > 0

  return {
    values: appv_values,
    errors: appv_errors,
    isSubmitting: appv_isSubmitting,
    hasErrors: appv_hasErrors,
    setValue: appf_setValue,
    setValues: appf_setValues,
    setError: appf_setError,
    clearError: appf_clearError,
    clearAllErrors: appf_clearAllErrors,
    validateField: appf_validateField,
    validateAll: appf_validateAll,
    reset: appf_reset,
    setSubmitting: appf_setSubmitting,
    getFieldProps: appf_getFieldProps
  }
}