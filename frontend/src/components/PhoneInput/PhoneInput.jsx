import React, { useState, forwardRef } from 'react'
import './PhoneInput.css'

const PhoneInput = forwardRef(function PhoneInput({ value, onChange, error, ...props }, ref) {
  const [displayValue, setDisplayValue] = useState(value || '')

  const formatPhone = (inputValue) => {
    // Удаляем все нецифровые символы
    const digits = inputValue.replace(/\D/g, '')

    // Обрабатываем только цифры
    if (!digits) return ''

    // Если начинается с 8, заменяем на 7
    let processedDigits = digits
    if (digits.startsWith('8')) {
      processedDigits = '7' + digits.slice(1)
    }

    // Если не начинается с 7, добавляем 7
    if (!processedDigits.startsWith('7')) {
      processedDigits = '7' + processedDigits
    }

    // Ограничиваем длину (11 цифр: 7 + 3 + 3 + 2 + 2)
    if (processedDigits.length > 11) {
      processedDigits = processedDigits.slice(0, 11)
    }

    // Форматируем: +7(XXX)-XXX-XX-XX
    if (processedDigits.length === 1) {
      return '+7'
    } else if (processedDigits.length <= 4) {
      return `+7(${processedDigits.slice(1)}`
    } else if (processedDigits.length <= 7) {
      return `+7(${processedDigits.slice(1, 4)})-${processedDigits.slice(4)}`
    } else if (processedDigits.length <= 9) {
      return `+7(${processedDigits.slice(1, 4)})-${processedDigits.slice(4, 7)}-${processedDigits.slice(7)}`
    } else {
      return `+7(${processedDigits.slice(1, 4)})-${processedDigits.slice(4, 7)}-${processedDigits.slice(7, 9)}-${processedDigits.slice(9)}`
    }
  }

  const handleChange = (e) => {
    const inputValue = e.target.value
    const formatted = formatPhone(inputValue)
    setDisplayValue(formatted)

    // Вызываем onChange только если номер полностью заполнен
    if (onChange) {
      onChange({
        target: {
          name: props.name || 'phone_number',
          value: formatted,
        },
      })
    }
  }

  // Обновляем displayValue при изменении value извне
  React.useEffect(() => {
    if (value !== undefined && value !== displayValue) {
      setDisplayValue(value || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className="phone-input-wrapper">
      <input
        ref={ref}
        type="tel"
        value={displayValue}
        onChange={handleChange}
        placeholder="+7(XXX)-XXX-XX-XX"
        className={`phone-input ${error ? 'error' : ''}`}
        {...props}
      />
      {error && <span className="phone-input-error">{error}</span>}
    </div>
  )
})

export default PhoneInput
