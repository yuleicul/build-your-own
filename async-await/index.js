import async from './async.js'

const getPost= async () => {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    const json = await res.json()
    console.log(res);
    console.log(json)
}
const getMyPost = async(function* () {
    const res = yield fetch('https://jsonplaceholder.typicode.com/posts/1');
    const json = yield res.json()
    console.log('yield', res);
    console.log('yield', json)
});

getPost();
getMyPost();
