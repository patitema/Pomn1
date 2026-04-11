import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useGetCurrentUserQuery } from '@shared/api'
import { setUser, setToken } from '@features/auth-by-login/model/authSlice'

/**
 * Компонент-инициализатор: при наличии токена в localStorage
 * загружает данные текущего пользователя и сохраняет в Redux store.
 * Должен быть подключён в App один раз.
 */
const UserInit = () => {
  const dispatch = useDispatch()
  const token = localStorage.getItem('token')

  const { data: user, isLoading, error } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  })

  useEffect(() => {
    if (token && !isLoading && user) {
      dispatch(setToken(token))
      dispatch(setUser(user))
    }
  }, [token, user, isLoading, dispatch])

  return null
}

export default UserInit
