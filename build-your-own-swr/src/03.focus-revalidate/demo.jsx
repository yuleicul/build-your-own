import { useState } from "react";
import useSWR from "swr";
import { createResponse } from "../utils";

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

      {/* TODO: Update 01 & 02 demos to ul/li */}
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
