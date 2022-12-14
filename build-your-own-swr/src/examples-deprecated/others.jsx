import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const defaultConfig = {
  // onLoadingSlow: () => {},
  // onSuccess: () => {},
  // onError: () => {},
  // onErrorRetry,

  // errorRetryInterval: ms('5s'),
  // focusThrottleInterval: ms('5s'),
  // dedupingInterval: ms('2s'),
  // loadingTimeout: ms('3s'),

  // refreshInterval: 0,
  revalidateOnFocus: true,
  // refreshWhenHidden: false,
  // shouldRetryOnError: true,
  // suspense: false
};

const cache = new Map();

const CONCURRENT_PROMISES = {};

const useSWR = (key, fetcher, config = defaultConfig) => {
  const _key = useMemo(() => {
    if (typeof key === "function") {
      return key();
    } else {
      return key;
    }
  }, [key]);

  const keyRef = useRef(_key);

  const [data, setData] = useState(cache.get(_key));
  const [error, setError] = useState();

  const revalidate = useCallback(async () => {
    try {
      let newData;
      if (!CONCURRENT_PROMISES[_key]) {
        CONCURRENT_PROMISES[_key] = fetcher(_key);
        setTimeout(() => {
          CONCURRENT_PROMISES[_key] = null;
        }, 1000);
        newData = await CONCURRENT_PROMISES[_key];
      } else {
        newData = await CONCURRENT_PROMISES[_key];
      }

      keyRef.current = _key;

      cache.set(_key, newData);
      console.log("cache", cache);
      setData(newData);
    } catch (_error) {
      console.log("_error", _error);
      setError(_error);
    }
  }, [_key, fetcher]);

  useEffect(() => {
    revalidate();
  }, [revalidate]);

  const onFocusListener = useCallback(() => {
    if (document.visibilityState === "visible") {
      revalidate();
    }
  }, [revalidate]);

  useEffect(() => {
    if (config.revalidateOnFocus) {
      window.onfocus = onFocusListener;
      document.onvisibilitychange = onFocusListener; // ? why not window
    }
    return () => {
      if (config.revalidateOnFocus) {
        window.onfocus = null;
        document.onvisibilitychange = null;
      }
    };
  });

  return { data: keyRef.current === _key ? data : cache.get(_key), error };
};

const fetcher = (url) => fetch(url).then((r) => r.json());

function App() {
  const [id, setId] = useState(1);
  const { data, error } = useSWR(
    `https://jsonplaceholder.typicode.com/users/${id}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );
  const { data: data2, error: error2 } = useSWR(
    `https://jsonplaceholder.typicode.com/users/${id}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );
  // const { data: data2, error: error2 } = useSWR(() => {
  //   return data && data.id
  //     ? `https://jsonplaceholder.typicode.com/users/${data.id}/todos`
  //     : `https://jsonplaceholder1.typicode.com/todos`;
  // }, fetcher);

  return (
    <div>
      <h1>Simple SWR</h1>

      <div>
        <button onClick={() => setId(1)}>1</button>
        <button onClick={() => setId(2)}>2</button>
        <button onClick={() => setId(3)}>3</button>
      </div>

      <div>
        {error ? "failed to load" : data ? JSON.stringify(data) : "loading..."}
      </div>
      <br />
      <div>
        {error2
          ? "failed to load"
          : data2
          ? JSON.stringify(data2)
          : "loading..."}
      </div>
    </div>
  );
}

export default App;
