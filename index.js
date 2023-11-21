require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')

app.use(express.json())

// eslint-disable-next-line no-unused-vars
morgan.token('body', (req, _res) => JSON.stringify(req.body))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const cors = require('cors')
app.use('/api/persons', cors())

//Serve static files from the React app
app.use(express.static('dist'))

app.get('/info', (request, response) => {
  const timeStamp = new Date()
  const length = Person.length
  response.send(`<p>Phonebook has info for ${length} people</p><p>${timeStamp}</p>`)
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    // eslint-disable-next-line no-unused-vars
    .then(_result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons/', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number ) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  // Does not check (yet) for duplicate names

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then( savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  console.log(request.params.id)
  console.log(person)

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
  1}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  // Incorrectly formatted id
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
    // Database validation error
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})