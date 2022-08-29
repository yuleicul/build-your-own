/**
 * 1. basic
 * 2. dependent args
 * 3. cache
 * *4. error: can not catch error
 *    https://github.com/vercel/swr/issues/282
 *    https://stackoverflow.com/questions/39297345/fetch-resolves-even-if-404
 * *5. error retry
 *    Exponential backoff
 * 6. dedupe
 * 7. revalidate on focus or when visibility changes
 *    *interval
 *    *blur the document then focusing and sending request at the same time... how to confirm returned data is newest
 * *8. rerender
 *
 * Good transition sentences:
 * 基于 stale-while-revalidate 的思想, 这里将 useFetch 命名为 useSWR ，同时将原有的 isLoading 命名为 isValidating ，将数据请求函数 fetchData 命名为 revalidate .
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const cache = new Map()

const CONCURRENT_PROMISES = {}

const useSWR = (key, fetcher) => {
  const _key = useMemo(() => {
    if (typeof key === 'function') {
      return key()
    } else {
      return key
    }
  }, [key])

  const keyRef = useRef(_key)

  const [data, setData] = useState(cache.get(_key))
  const [error, setError] = useState()

  const revalidate = useCallback(async () => {
    const _data = await fetcher(_key)

    keyRef.current = _key

    cache.set(_key, _data)
    console.log('cache', cache)
    setData(_data)
  }, [fetcher, _key])

  const onFocusListener = useCallback(() => {
    if (document.visibilityState === 'visible') {
      revalidate()
    }
  }, [revalidate])

  useEffect(() => {
    window.onfocus = onFocusListener
    document.onvisibilitychange = onFocusListener // ? why not window

    try {
      if (!CONCURRENT_PROMISES[_key]) {
        CONCURRENT_PROMISES[_key] = revalidate()
        setTimeout(() => {
          CONCURRENT_PROMISES[_key] = null
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
  }, [_key, revalidate, onFocusListener])

  return { data: keyRef.current === _key ? data : cache.get(_key), error }
}

const fetcher = (url) => fetch(url).then((r) => r.json())

function App() {
  const [id, setId] = useState(1)
  const { data, error } = useSWR(
    `https://jsonplaceholder.typicode.com/users/${id}`,
    fetcher
  )
  const { data: data2, error: error2 } = useSWR(() => {
    return data?.id
      ? `https://jsonplaceholder.typicode.com/users/${data?.id}/todos`
      : `https://jsonplaceholder1.typicode.com/todos`
  }, fetcher)

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
