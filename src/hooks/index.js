import { useState, useEffect, useCallback } from 'react'
export function useDebounce(value, ms = 300) {
  const [v, setV] = useState(value)
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t) }, [value, ms])
  return v
}
export function useFetch(fn, deps = []) {
  const [s, setS] = useState({ data: null, loading: true, error: null })
  const run = useCallback(() => {
    setS(p => ({ ...p, loading: true, error: null }))
    fn().then(data => setS({ data, loading: false, error: null })).catch(error => setS({ data: null, loading: false, error }))
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(run, [run])
  return { ...s, reload: run, setData: data => setS(p => ({ ...p, data })) }
}
