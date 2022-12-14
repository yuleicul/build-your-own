import { useState } from "react";
import useSWR from "swr";
import { createResponse } from "../utils";

const slowFetcher = (id) =>
  createResponse(
    fetch(`https://api.github.com/repos/${id}`).then((r) => r.json()),
    3000
  );

const fastFetcher = (id) =>
  createResponse(
    fetch(`https://api.github.com/repos/${id}`).then((r) => r.json()),
    1000
  );

export default function TrendingProjects() {
  const [id, setId] = useState("facebook/react");
  const { data } = useSWR(id, slowFetcher, { dedupingInterval: 0 });
  const { data: dupingData } = useSWR(id, fastFetcher, {
    dedupingInterval: 0,
  });

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
