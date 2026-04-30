const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api'

const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${baseUrl}/${cleanEndpoint}`.replace(/([^:]\/)\/+/g, '$1')
}

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
