1.  basic
2.  dependent args
3.  cache
4.  error
    https://github.com/vercel/swr/issues/282
    https://stackoverflow.com/questions/39297345/fetch-resolves-even-if-404
5.  (todo) error retry
    Exponential backoff
6.  dedupe
7.  revalidate on focus or when visibility changes
    (todo) interval
    (todo) blur the document then focusing and sending request at the same time... how to confirm returned data is newest
8.  (todo) rerender
9.  (todo) suspense and throw
    Good transition sentences:
    基于 stale-while-revalidate 的思想, 这里将 useFetch 命名为 useSWR ，同时将原有的 isLoading 命名为 isValidating ，将数据请求函数 fetchData 命名为 revalidate .
