import { useState, useEffect, useRef } from "react";
import { createResponse } from "../../utils";

const cache = new Map();

const useSWR = (key, fetcher) => {
  const keyRef = useRef(key);
  const [data, setData] = useState();

  useEffect(() => {
    async function fetch() {
      const newData = await fetcher(key);

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

  return (
    <div>
      <h1>Trending Projects</h1>
      <button onClick={() => setId("facebook/react")}>React</button>{" "}
      <button onClick={() => setId("vercel/swr")}>SWR</button>{" "}
      <button onClick={() => setId("TanStack/query")}>TanStack Query</button>
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
    </div>
  );
}
