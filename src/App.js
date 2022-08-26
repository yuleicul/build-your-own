/**
 * 1. basic
 * 2. dependent args
 * 3. cache
 * *4. error: can not catch error
 *    https://github.com/vercel/swr/issues/282
 *    https://stackoverflow.com/questions/39297345/fetch-resolves-even-if-404
 * *5. error retry
 *    Exponential backoff
 * 6. dedup
 * 7. revalidate on focus or when visibility changes
 *    *interval
 */

import { useCallback, useEffect, useRef, useState } from 'react'

const cache = new Map()

const CONCURRENT_PROMISES = {}

const useSWR = (key, fetcher) => {
  const keyRef = useRef(key)

  const [data, setData] = useState(cache.get(key))
  const [error, setError] = useState()

  const revalidate = useCallback(async () => {
    const _data = await fetcher(key)

    keyRef.current = key

    cache.set(key, _data)
    console.log('cache', cache)
    setData(_data)
  }, [fetcher, key])

  const onFocusListener = useCallback(() => {
    if (document.visibilityState === 'visible') {
      revalidate()
    }
  }, [revalidate])

  useEffect(() => {
    window.onfocus = onFocusListener
    document.onvisibilitychange = onFocusListener // ? why not window

    try {
      if (!CONCURRENT_PROMISES[key]) {
        CONCURRENT_PROMISES[key] = revalidate()
        setTimeout(() => {
          CONCURRENT_PROMISES[key] = null
        }, 1000)
      }
    } catch (_error) {
      console.log('_error', _error)
      setError(_error)
    }

    return () => {
      window.onfocus = null
      document.onvisibilitychange = null
    }
  }, [key, revalidate, onFocusListener])

  return { data: keyRef.current === key ? data : cache.get(key), error }
}

const fetcher = (url) => fetch(url).then((r) => r.json())

function App() {
  const [id, setId] = useState(1)
  const { data, error } = useSWR(
    `https://jsonplaceholder.typicode.com/todos/${id}`,
    fetcher
  )
  const { data: data2, error: error2 } = useSWR(
    `https://jsonplaceholder.typicode.com/todos/${id}`,
    fetcher
  )

  return (
    <div>
      <h1>Simple SWR</h1>

      <div>
        <button onClick={() => setId(1)}>1</button>
        <button onClick={() => setId(2)}>2</button>
        <button onClick={() => setId(3)}>3</button>
      </div>

      <div>
        {error ? 'failed to load' : data ? JSON.stringify(data) : 'loading...'}
      </div>

      <div>
        {error2
          ? 'failed to load'
          : data2
          ? JSON.stringify(data2)
          : 'loading...'}
      </div>
    </div>
  )
}

export default App
