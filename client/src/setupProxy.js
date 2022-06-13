<<<<<<< HEAD

const proxy = require('http-proxy-middleware')

module.exports = function(app) {
  app.use(proxy('/api', { target: 'http://localhost:5000/' }))
  app.use(proxy('/auth/google', { target: 'http://localhost:5000/' }))
=======

const proxy = require('http-proxy-middleware')

module.exports = function(app) {
  app.use(proxy('/api', { target: 'http://localhost:5000/' }))
  app.use(proxy('/auth/google', { target: 'http://localhost:5000/' }))
>>>>>>> e24a3d73359565e19df24b8eab4635a3c465f6f8
}