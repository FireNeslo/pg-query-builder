const METHODS = require('./methods')
const QueryGenerator = require('./generator')

function assign(target, [key, value]) {
  if(!target[key]) target[key] = []
  target[key].push(value)
  return target
}

function toObject(array) {
  return array.reduce(assign, {})
}

function query(exec=v=>v, value=[], property='from') {
  function queryProxy(...args) {
    return query(exec, value.concat([ [property, args] ]))
  }
  queryProxy.then = function(...args) {
    return Promise.resolve(exec(queryProxy)).then(...args)
  }
  queryProxy.toJSON = function toJSON(indent) {
    return new QueryGenerator(toObject(value), indent).toJSON()
  }
  queryProxy.toSQL = queryProxy.toString = function toJSON(indent) {
    return new QueryGenerator(toObject(value), indent).toString()
  }
  METHODS.forEach(method => {
    Object.defineProperty(queryProxy, method, {
      get() {
        return query(exec, value, method)
      }
    })
  })
  return queryProxy
}


module.exports = query
