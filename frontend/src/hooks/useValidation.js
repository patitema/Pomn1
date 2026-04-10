import { useState, useCallback } from 'react'

// Regex паттерны для валидации
const PATTERNS = {
  username: /^[a-zA-Zа-яА-ЯёЁ0-9_]{3,20}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/,
  passwordDigit: /\d/,
  passwordSpecial: /[!_-]/,
}

export function useValidation() {
  const [errors, setErrors] = useState({})

  const validateUsername = useCallback((username) => {
    if (!username) {
      return 'Логин обязателен'
    }
    if (username.length < 3) {
      return 'Логин должен содержать минимум 3 символа'
    }
    if (username.length > 20) {
      return 'Логин не должен превышать 20 символов'
    }
    if (!PATTERNS.username.test(username)) {
      return 'Логин может содержать только буквы, цифры и подчёркивание'
    }
    return null
  }, [])

  const validatePassword = useCallback((password) => {
    if (!password) {
      return 'Пароль обязателен'
    }
    if (password.length < 8) {
      return 'Пароль должен содержать минимум 8 символов'
    }
    if (!PATTERNS.passwordDigit.test(password)) {
      return 'Пароль должен содержать минимум одну цифру'
    }
    if (!PATTERNS.passwordSpecial.test(password)) {
      return 'Пароль должен содержать минимум один спецсимвол (!, _ или -)'
    }
    return null
  }, [])

  const validateEmail = useCallback((email) => {
    if (!email) {
      return 'Email обязателен'
    }
    if (!PATTERNS.email.test(email)) {
      return 'Неверный формат email'
    }
    return null
  }, [])

  const validatePhone = useCallback((phone) => {
    if (!phone) {
      return 'Телефон обязателен'
    }
    if (!PATTERNS.phone.test(phone)) {
      return 'Введите номер в формате +7(XXX)-XXX-XX-XX'
    }
    return null
  }, [])

  const validateAll = useCallback((data) => {
    const newErrors = {}

    const usernameError = validateUsername(data.username)
    if (usernameError) newErrors.username = usernameError

    const passwordError = validatePassword(data.password)
    if (passwordError) newErrors.password = passwordError

    const emailError = validateEmail(data.email)
    if (emailError) newErrors.email = emailError

    const phoneError = validatePhone(data.phone_number)
    if (phoneError) newErrors.phone_number = phoneError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [validateUsername, validatePassword, validateEmail, validatePhone])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  return {
    errors,
    validateUsername,
    validatePassword,
    validateEmail,
    validatePhone,
    validateAll,
    clearErrors,
    clearError,
  }
}
