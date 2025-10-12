// src/components/common/FormField.tsx
import './FormField.scss'

interface FormFieldProps {
  type: 'text' | 'email' | 'password' | 'textarea'
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  disabled?: boolean
  rows?: number
}

export default function FormField({
  type,
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  disabled = false,
  rows = 4
}: FormFieldProps) {
  const appf_handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="form-field">
      <label htmlFor={name} className="form-field__label">
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={appf_handleChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`form-field__textarea ${error ? 'form-field__textarea--error' : ''}`}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={appf_handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`form-field__input ${error ? 'form-field__input--error' : ''}`}
        />
      )}
      {error && <span className="form-field__error">{error}</span>}
    </div>
  )
}