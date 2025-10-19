// src/components/common/FormField.tsx
import './FormField.scss'

interface Option {
  value: string
  label: string
}

interface FormFieldProps {
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'number' | 'date' | 'datetime-local'
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  disabled?: boolean
  rows?: number
  options?: Option[]
  required?: boolean
  step?: string
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
  rows = 4,
  options = [],
  required = false,
  step
}: FormFieldProps) {
  const appf_handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="form-field">
      <label htmlFor={name} className="form-field__label">
        {label}
        {required && <span className="form-field__required"> *</span>}
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
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={appf_handleChange}
          disabled={disabled}
          className={`form-field__select ${error ? 'form-field__select--error' : ''}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={appf_handleChange}
          placeholder={placeholder}
          disabled={disabled}
          step={step}
          className={`form-field__input ${error ? 'form-field__input--error' : ''}`}
        />
      )}
      {error && <span className="form-field__error">{error}</span>}
    </div>
  )
}