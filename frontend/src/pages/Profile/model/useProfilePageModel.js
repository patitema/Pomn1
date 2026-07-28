import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout as clearAuth, selectCurrentUser } from '@entities/user'
import { useLogoutMutation, useUpdateProfileMutation } from '@shared/api'
import { routes } from '@shared/config'
import {
  createProfileFormData,
  emptyProfileFormData,
  updateProfileFormField,
} from './profilePageModel'

const profileUpdatedMessage = 'Профиль обновлён'
const profileUpdateFallbackError = 'Ошибка обновления'

export const useProfilePageModel = () => {
  const user = useSelector(selectCurrentUser)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [logout] = useLogoutMutation()
  const [updateProfile] = useUpdateProfileMutation()
  const [formData, setFormData] = useState(emptyProfileFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (user) {
      setFormData(createProfileFormData(user))
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      dispatch(clearAuth())
      navigate(routes.auth)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      await updateProfile(formData).unwrap()
      setSuccessMessage(profileUpdatedMessage)
    } catch (err) {
      console.error('Failed to update profile:', err)
      setErrorMessage(err.data?.error || profileUpdateFallbackError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field) => (event) => {
    setFormData((currentFormData) =>
      updateProfileFormField(currentFormData, field, event.target.value)
    )
  }

  return {
    errorMessage,
    formData,
    handleChange,
    handleLogout,
    handleSubmit,
    isSubmitting,
    successMessage,
    user,
  }
}
