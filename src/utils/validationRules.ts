// src/utils/validationRules.ts
// フォームバリデーションルールを共通化

import { AUTH_ERROR_MESSAGES } from '../constants/errorMessages'
import { VALIDATION } from '../constants/appConstants'

export const validationRules = {
  email: {
    custom: (value: string) => {
      if (!value.trim()) return AUTH_ERROR_MESSAGES.EMAIL_REQUIRED
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return AUTH_ERROR_MESSAGES.EMAIL_INVALID
      }
      return undefined
    }
  },
  
  password: {
    custom: (value: string) => {
      if (!value.trim()) return AUTH_ERROR_MESSAGES.PASSWORD_REQUIRED
      if (value.length < VALIDATION.PASSWORD.MIN_LENGTH) return AUTH_ERROR_MESSAGES.PASSWORD_TOO_SHORT
      return undefined
    }
  },
  
  username: {
    custom: (value: string) => {
      if (!value.trim()) return AUTH_ERROR_MESSAGES.USERNAME_REQUIRED
      if (value.length < VALIDATION.USERNAME.MIN_LENGTH) return AUTH_ERROR_MESSAGES.USERNAME_TOO_SHORT
      if (value.length > VALIDATION.USERNAME.MAX_LENGTH) return AUTH_ERROR_MESSAGES.USERNAME_TOO_LONG
      return undefined
    }
  },
  
  // パスワード確認用（動的にパスワードと比較する必要があるため関数を返す）
  confirmPassword: (passwordValue: string) => ({
    custom: (value: string) => {
      if (!value.trim()) return AUTH_ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED
      if (value !== passwordValue) return AUTH_ERROR_MESSAGES.PASSWORD_MISMATCH
      return undefined
    }
  })
}