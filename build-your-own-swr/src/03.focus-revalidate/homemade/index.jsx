import { useState, useEffect, useRef, useCallback } from "react";
import { createResponse } from "../../utils";
// How to elaborate on this:
// 1. show the official demo
// Q&A:
// 1. why `visibilityChange` is on Document (MDN)
// while `focus` is on Window （the outerlayer)
// 2. Why we cannot use `on` event (may override users' events)

const cache = new Map();

const CONCURRENT_PROMISES = {};

const useSWR = (key, fetcher) => {
  const keyRef = useRef(key);
  const [data, setData] = useState();

  const revalidate = useCallback(async () => {
    let newData;
    if (!CONCURRENT_PROMISES[key]) {
      CONCURRENT_PROMISES[key] = fetcher(key);

      setTimeout(() => {
        CONCURRENT_PROMISES[key] = null;
      }, 1000);

      newData = await CONCURRENT_PROMISES[key];
    } else {
      newData = await CONCURRENT_PROMISES[key];
    }

    keyRef.current = key;
    cache.set(key, newData);

    setData(newData);
  }, [fetcher, key]);

  // https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState
  const visibilityChangeListener = useCallback(() => {
    if (document.visibilityState === "visible") revalidate();
  }, [revalidate]);

  useEffect(() => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
    document.addEventListener("visibilitychange", visibilityChangeListener);
    window.addEventListener("focus", revalidate);

    revalidate();

    return () => {
      document.removeEventListener(
        "visibilitychange",
        visibilityChangeListener
      );
      window.removeEventListener("focus", revalidate);
    };
  }, [revalidate, visibilityChangeListener]);

  return { data: keyRef.current === key ? data : cache.get(key) };
};

const fetcher = (id) =>
  createResponse(
    fetch(`https://api.github.com/repos/${id}`)
      .then((r) => r.json())
      .then((r) =>
        Object.assign(r, { updated_at: new Date().toLocaleString() })
      ),
    1000
  );

export default function TrendingProjects() {
  const [id, setId] = useState("facebook/react");
  const { data } = useSWR(id, fetcher);

  return (
    <div>
      <h1>Trending Projects</h1>

      <div>
        <button onClick={() => setId("facebook/react")}>React</button>{" "}
        <button onClick={() => setId("vercel/swr")}>SWR</button>{" "}
        <button onClick={() => setId("TanStack/query")}>TanStack Query</button>
      </div>

      {data ? (
        <>
          <h2>{id}</h2>
          <ul>
            <li>forks: {data.forks_count}</li>
            <li>stars: {data.stargazers_count}</li>
            <li>watchers: {data.watchers}</li>
          </ul>
          <p>updated at: {data.updated_at}</p>
        </>
      ) : (
        <p>loading...</p>
      )}
    </div>
  );
}
