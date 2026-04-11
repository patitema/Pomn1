import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useGetCurrentUserQuery } from '@shared/api'
import { setUser, setToken, logout as clearAuth } from '@features/auth-by-login/model/authSlice'
import { Loader } from '@shared/ui'

/**
 * Компонент-инициализатор: при наличии токена в localStorage
 * загружает данные текущего пользователя и сохраняет в Redux store.
 * Должен быть подключён в App один раз.
 *
 * Показывает Loader пока идёт инициализация — ProtectedRoute
 * не редиректнет до завершения.
 */
const UserInit = () => {
  const dispatch = useDispatch()
  const token = localStorage.getItem('token')
  const [isInitialized, setIsInitialized] = useState(false)

  const { data: user, isLoading, isError } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  })

  useEffect(() => {
    if (!token) {
      dispatch(clearAuth())
      setIsInitialized(true)
      return
    }

    if (isLoading) return

    if (isError) {
      localStorage.removeItem('token')
      dispatch(clearAuth())
      setIsInitialized(true)
      return
    }

    if (user) {
      dispatch(setToken(token))
      dispatch(setUser(user))
      setIsInitialized(true)
    }
  }, [token, user, isLoading, isError, dispatch])

  if (!isInitialized) {
    return <Loader />
  }

  return null
}

export default UserInit
