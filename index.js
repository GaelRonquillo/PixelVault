import express from 'express';
const app = express()
const port = 3000

app.get('/', (request, response) => {
    console.log('Hello World!')
})

app.listen(port, () => {
    console.log(`servidor en http://localhost:${port}`)
})