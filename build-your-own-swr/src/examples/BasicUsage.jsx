import { useState, useEffect } from "react";

const useSWR = (key, fetcher) => {
  const [data, setData] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    async function fetch() {
      try {
        const newData = await fetcher(key);
        setData(newData);
      } catch (error) {
        setError(error);
      }
    }
    fetch();
  }, [fetcher, key]);

  return { data, error };
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
  const { data, error } = useSWR(id, fetcher);

  return (
    <div>
      <h1>My Blog</h1>

      <button onClick={() => setId(1)}>1</button>
      <button onClick={() => setId(2)}>2</button>
      <button onClick={() => setId(3)}>3</button>

      {error ? (
        <p>Failed to load</p>
      ) : data ? (
        <div>
          <h2>{data.title}</h2>
          <p>{data.body}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
