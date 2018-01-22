const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

// Begin App
const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

app.get('/status', (req, res) => {
  res.send({
    message: 'server online'
  })
})

app.post('/register', (req, res) => {
  res.send({
    message: `${req.body.email} is registered`
  })
})

app.listen(process.env.PORT || 3000)
