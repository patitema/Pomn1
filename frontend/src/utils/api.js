// Базовый URL для API
// Если начинается с / — относительный путь (для nginx), иначе полный URL
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api'

// Убираем trailing slash для консистентности
const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL

/**
 * Получить полный URL для endpoint
 * @param {string} endpoint - endpoint относительно API (например, 'notes/')
 * @returns {string}
 */
export const getApiUrl = (endpoint) => {
  // Убираем ведущий слэш у endpoint, чтобы не было дублирования
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${baseUrl}/${cleanEndpoint}`.replace(/\/+/g, '/')
}

/**
 * Выполнить fetch запрос к API
 * @param {string} endpoint - endpoint относительно API
 * @param {RequestInit} options - опции fetch
 * @returns {Promise<Response>}
 */
export const fetchApi = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint)
  
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Token ${token}` }),
    ...options.headers,
  }

  return fetch(url, { ...options, headers })
}
