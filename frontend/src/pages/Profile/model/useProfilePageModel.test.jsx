import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useProfilePageModel } from './useProfilePageModel'

const mocks = vi.hoisted(() => ({
  clearAuthAction: { type: 'auth/logout' },
  currentUser: null,
  dispatch: vi.fn(),
  lastUpdateProfileBody: null,
  logoutUnwrap: vi.fn(),
  navigate: vi.fn(),
  updateProfileUnwrap: vi.fn(),
}))

vi.mock('react-redux', () => ({
  useDispatch: () => mocks.dispatch,
  useSelector: (selector) => selector({ auth: { user: mocks.currentUser } }),
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
}))

vi.mock('@entities/user', () => ({
  logout: () => mocks.clearAuthAction,
  selectCurrentUser: (state) => state.auth.user,
}))

vi.mock('@shared/api', () => ({
  useLogoutMutation: () => [() => ({ unwrap: mocks.logoutUnwrap })],
  useUpdateProfileMutation: () => [
    (body) => {
      mocks.lastUpdateProfileBody = body
      return { unwrap: mocks.updateProfileUnwrap }
    },
  ],
}))

vi.mock('@shared/config', () => ({
  routes: { auth: '/auth' },
}))

describe('useProfilePageModel', () => {
  let consoleErrorSpy

  beforeEach(() => {
    mocks.currentUser = {
      username: 'Ada',
      email: 'ada@example.test',
      phone_number: '79990000000',
    }
    mocks.dispatch.mockReset()
    mocks.navigate.mockReset()
    mocks.logoutUnwrap.mockReset()
    mocks.logoutUnwrap.mockResolvedValue({})
    mocks.updateProfileUnwrap.mockReset()
    mocks.updateProfileUnwrap.mockResolvedValue({})
    mocks.lastUpdateProfileBody = null
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('initializes form data from the current user and updates fields', async () => {
    const { result } = renderHook(() => useProfilePageModel())

    await waitFor(() => {
      expect(result.current.formData.username).toBe('Ada')
    })

    act(() => {
      result.current.handleChange('email')({ target: { value: 'new@example.test' } })
    })

    expect(result.current.formData).toEqual({
      username: 'Ada',
      email: 'new@example.test',
      phone_number: '79990000000',
    })
  })

  it('submits the current form and shows a success message', async () => {
    const { result } = renderHook(() => useProfilePageModel())
    const event = { preventDefault: vi.fn() }

    await waitFor(() => {
      expect(result.current.formData.username).toBe('Ada')
    })

    await act(async () => {
      await result.current.handleSubmit(event)
    })

    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(mocks.lastUpdateProfileBody).toEqual({
      username: 'Ada',
      email: 'ada@example.test',
      phone_number: '79990000000',
    })
    expect(result.current.successMessage).not.toBe('')
    expect(result.current.errorMessage).toBe('')
    expect(result.current.isSubmitting).toBe(false)
  })

  it('shows the API error when profile update fails', async () => {
    mocks.updateProfileUnwrap.mockRejectedValueOnce({ data: { error: 'Bad phone' } })
    const { result } = renderHook(() => useProfilePageModel())

    await waitFor(() => {
      expect(result.current.formData.username).toBe('Ada')
    })

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() })
    })

    expect(result.current.successMessage).toBe('')
    expect(result.current.errorMessage).toBe('Bad phone')
    expect(result.current.isSubmitting).toBe(false)
  })

  it('clears local auth and navigates to auth after logout even when API logout fails', async () => {
    mocks.logoutUnwrap.mockRejectedValueOnce(new Error('network'))
    const { result } = renderHook(() => useProfilePageModel())

    await act(async () => {
      await result.current.handleLogout()
    })

    expect(mocks.dispatch).toHaveBeenCalledWith(mocks.clearAuthAction)
    expect(mocks.navigate).toHaveBeenCalledWith('/auth')
  })
})
