// Базовый URL для API
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api'

/**
 * Получить полный URL для endpoint
 * @param {string} endpoint - endpoint относительно API (например, 'notes/')
 * @returns {string}
 */
export const getApiUrl = (endpoint) => {
  return `${API_URL}/${endpoint}`.replace(/\/+/g, '/')
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
