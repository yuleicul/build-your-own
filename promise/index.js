import Pledge from './Pledge.js'

const pledge = new Pledge((resolve, reject) => {
    console.log('MyPromise constructor')
    fetch('https://jsonplaceholder.typicode.com/posts/1')
        .then(resolve)
        .catch(reject)
})

const promise = new Promise((resolve, reject) => {
    console.log('Promise constructor')
    fetch('https://jsonplaceholder.typicode.com/posts/1')
        .then(resolve)
        .catch(reject)
})


pledge.then(res => res.json()).then(res => console.log('myPromise', res))
promise.then(res => res.json()).then(res => console.log('promise', res))
