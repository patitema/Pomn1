export const emptyProfileFormData = {
  username: '',
  email: '',
  phone_number: '',
}

export const createProfileFormData = (user) => ({
  username: user?.username || '',
  email: user?.email || '',
  phone_number: user?.phone_number || '',
})

export const updateProfileFormField = (formData, field, value) => ({
  ...formData,
  [field]: value,
})
