import { describe, expect, it } from 'vitest'
import {
  createProfileFormData,
  emptyProfileFormData,
  updateProfileFormField,
} from './profilePageModel'

describe('profile page model', () => {
  it('creates an empty profile form when user is missing', () => {
    expect(createProfileFormData(null)).toEqual(emptyProfileFormData)
  })

  it('normalizes missing user fields to empty strings', () => {
    expect(createProfileFormData({ username: 'Ada' })).toEqual({
      username: 'Ada',
      email: '',
      phone_number: '',
    })
  })

  it('creates profile form data from current user fields', () => {
    expect(createProfileFormData({
      username: 'Ada',
      email: 'ada@example.test',
      phone_number: '79990000000',
    })).toEqual({
      username: 'Ada',
      email: 'ada@example.test',
      phone_number: '79990000000',
    })
  })

  it('updates one form field without mutating the original object', () => {
    const currentFormData = {
      username: 'Ada',
      email: 'ada@example.test',
      phone_number: '',
    }

    const nextFormData = updateProfileFormField(
      currentFormData,
      'phone_number',
      '79990000000'
    )

    expect(nextFormData).toEqual({
      username: 'Ada',
      email: 'ada@example.test',
      phone_number: '79990000000',
    })
    expect(currentFormData.phone_number).toBe('')
  })
})
