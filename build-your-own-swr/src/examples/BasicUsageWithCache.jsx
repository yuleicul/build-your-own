import { useState, useEffect } from "react";

const cache = new Map();

const useSWR = (key, fetcher) => {
  const [data, setData] = useState(cache.get(key));

  useEffect(() => {
    async function fetch() {
      setData(undefined);
      const newData = await fetcher(key);
      setData(newData);
    }
    fetch();
  }, [fetcher, key]);

  return { data };
};

const createResponse = (response, delay) =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      if (response instanceof Error) {
        reject(response);
      } else {
        resolve(response);
      }
    }, delay)
  );

const fetcher = (id) =>
  createResponse(
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then((r) =>
      r.json()
    ),
    1000
  );

export default function BasicUsage() {
  const [id, setId] = useState(1);
  const { data } = useSWR(id, fetcher);

  return (
    <div>
      <h1>My Blog</h1>
      <button onClick={() => setId(1)}>Blog 1</button>{" "}
      <button onClick={() => setId(2)}>Blog 2</button>{" "}
      <button onClick={() => setId(3)}>Blog 3</button>
      {data ? (
        <p>
          <strong>
            Blog {id}: {data.title}
          </strong>
          <p>{data.body}</p>
        </p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
