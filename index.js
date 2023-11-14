const express = require('express')
const app = express()

app.use(express.json())

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})
