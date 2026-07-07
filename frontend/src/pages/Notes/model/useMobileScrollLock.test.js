import React from 'react'
import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMobileScrollLock } from './useMobileScrollLock'

const ScrollLockTest = ({ isLocked }) => {
  useMobileScrollLock(isLocked)
  return null
}

describe('useMobileScrollLock', () => {
  afterEach(() => {
    document.body.style.cssText = ''
    document.documentElement.style.cssText = ''
    vi.restoreAllMocks()
  })

  it('locks document scroll on mobile while enabled and restores it after cleanup', () => {
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
      configurable: true,
    })
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    Object.defineProperty(window, 'scrollY', {
      value: 128,
      configurable: true,
    })

    const { unmount } = render(React.createElement(ScrollLockTest, { isLocked: true }))

    expect(document.body.style.position).toBe('fixed')
    expect(document.body.style.top).toBe('-128px')
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.documentElement.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.position).toBe('')
    expect(document.body.style.top).toBe('')
    expect(document.body.style.overflow).toBe('')
    expect(document.documentElement.style.overflow).toBe('')
    expect(window.scrollTo).toHaveBeenCalledWith(0, 128)
  })
})
