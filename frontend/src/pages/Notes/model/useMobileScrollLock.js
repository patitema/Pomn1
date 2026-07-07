import { useEffect } from 'react'

export const MOBILE_READER_SCROLL_LOCK_QUERY = '(max-width: 1199px)'

export const useMobileScrollLock = (
  isLocked,
  mediaQuery = MOBILE_READER_SCROLL_LOCK_QUERY
) => {
  useEffect(() => {
    if (!isLocked || typeof window === 'undefined') return undefined

    const isMobileLayout = typeof window.matchMedia === 'function'
      ? window.matchMedia(mediaQuery).matches
      : true

    if (!isMobileLayout) return undefined

    const { body, documentElement } = document
    const scrollY = window.scrollY || window.pageYOffset || 0
    const previousBodyOverflow = body.style.overflow
    const previousBodyPosition = body.style.position
    const previousBodyTop = body.style.top
    const previousBodyWidth = body.style.width
    const previousHtmlOverflow = documentElement.style.overflow

    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    documentElement.style.overflow = 'hidden'

    return () => {
      body.style.overflow = previousBodyOverflow
      body.style.position = previousBodyPosition
      body.style.top = previousBodyTop
      body.style.width = previousBodyWidth
      documentElement.style.overflow = previousHtmlOverflow
      window.scrollTo(0, scrollY)
    }
  }, [isLocked, mediaQuery])
}
