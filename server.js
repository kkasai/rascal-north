process.env.VUE_ENV = 'server'

const fs = require('fs')
const path = require('path')

const express = require('express')
const app = module.exports = express()

app.use('/', express.static(
  path.resolve(__dirname, 'dist')
))


const port = process.env.PORT || 3000
app.listen(port, err => {
  if (err) {
    throw err
  }
  console.log(`Server is running at localhost:${port}`)
})
