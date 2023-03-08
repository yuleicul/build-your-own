import { useState, useEffect, useRef } from "react";
import { createResponse } from "../../utils";

const cache = new Map();

const CONCURRENT_PROMISES = {};

const useSWR = (key, fetcher) => {
  const keyRef = useRef(key);
  const [data, setData] = useState();

  useEffect(() => {
    async function fetch() {
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
    }
    fetch();
  }, [fetcher, key]);

  return { data: keyRef.current === key ? data : cache.get(key) };
};

const fetcher = (id) =>
  createResponse(
    fetch(`https://api.github.com/repos/${id}`).then((r) => r.json()),
    1000
  );

export default function TrendingProjects() {
  const [id, setId] = useState("facebook/react");
  const { data } = useSWR(id, fetcher);
  const { data: dupingData } = useSWR(id, fetcher);

  return (
    <div>
      <h1>Trending Projects</h1>

      <div>
        <button onClick={() => setId("facebook/react")}>React</button>{" "}
        <button onClick={() => setId("vercel/swr")}>SWR</button>{" "}
        <button onClick={() => setId("TanStack/query")}>TanStack Query</button>
      </div>

      {data ? (
        <div>
          <h2>{id}</h2>
          <p>forks: {data.forks_count}</p>
          <p>stars: {data.stargazers_count}</p>
          <p>watchers: {data.watchers}</p>
        </div>
      ) : (
        <p>loading...</p>
      )}

      {dupingData ? (
        <div>
          <h2>{id}</h2>
          <p>forks: {data.forks_count}</p>
          <p>stars: {data.stargazers_count}</p>
          <p>watchers: {data.watchers}</p>
        </div>
      ) : (
        <p>loading...</p>
      )}
    </div>
  );
}
