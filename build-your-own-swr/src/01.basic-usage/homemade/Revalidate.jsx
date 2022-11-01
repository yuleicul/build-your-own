// Update `fetch` to `revalidate`
// because stale-while-revalidate

import { useState, useEffect, useRef, useCallback } from "react";
import { createResponse } from "../../utils";

const cache = new Map();

const useSWR = (key, fetcher) => {
  const keyRef = useRef(key);
  const [data, setData] = useState();

  const revalidate = useCallback(async () => {
    const newData = await fetcher(key);

    keyRef.current = key;
    cache.set(key, newData);

    setData(newData);
  }, [fetcher, key]);

  useEffect(() => {
    revalidate();
  }, [revalidate]);

  return {
    data: keyRef.current === key ? data : cache.get(key),
  };
};

const fetcher = (id) =>
  createResponse(
    fetch(`https://api.github.com/repos/${id}`).then((r) => r.json()),
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
        </>
      ) : (
        <p>loading...</p>
      )}
    </div>
  );
}
