import { useCallback, useEffect, useRef, useState } from 'react'
import { extractErrorMessage, isNetworkError } from '../lib/api.js'

/**
 * The one place a screen's loading / success / error / retry states come from.
 *
 * Every API-driven surface in the storefront runs through this, so no screen
 * can accidentally ship without an error branch and no API failure is ever
 * swallowed into a blank page.
 *
 * `deps` behaves like a `useEffect` dependency array: change them and the
 * request re-runs. `run()` re-issues the same request — that is the retry
 * button's handler.
 *
 * Out-of-order responses are dropped by sequence number rather than by an
 * AbortController, so a slow first request can never overwrite a fast second
 * one (the classic filter-then-type race on the shop page).
 */
export function useAsync(asyncFn, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(immediate)

  const fnRef = useRef(asyncFn)
  fnRef.current = asyncFn

  const requestId = useRef(0)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const run = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)

    try {
      const result = await fnRef.current()
      if (!mounted.current || id !== requestId.current) return undefined
      setData(result)
      return result
    } catch (err) {
      if (!mounted.current || id !== requestId.current) return undefined
      setError({
        message: extractErrorMessage(err),
        isNetwork: isNetworkError(err),
        status: err?.response?.status ?? null,
        code: err?.response?.data?.code ?? null,
      })
      return undefined
    } finally {
      if (mounted.current && id === requestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!immediate) return
    run()
    // `run` is stable; the caller's deps are what should re-trigger the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, error, loading, run, setData }
}
