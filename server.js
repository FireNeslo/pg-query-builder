const express = require('express')
const budo = require('budo')

budo(__dirname+'/demo/index.js', {
  live: true,
  debug: true,
  stream: process.stdout,
  middleware: express()
    .get('/hello', function(req, res) {
      res.end('Hello')
    })
})
