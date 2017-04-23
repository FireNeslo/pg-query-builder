const snakeCase = require('lodash/snakeCase')
const pluralize = require('pluralize')

exports.Query = require('./lib/query')

exports.Model = class Model {
  static get className() {
    return this.displayName || this.name
  }
  static get tableName() {
    return snakeCase(pluralize(this.className))
  }
  static get foreignKey() {
    return snakeCase(this.className+'Id')
  }
  static get primaryKey() {
    return 'id'
  }
}


exports.property = function property(...type) {
  return function define(prototype, property, descriptor) {
    const Class = prototype.constructor

    if(!Class.properties) Class.properties = {}

    Class.properties[property] = type

    return {
      configurable: true,
      get() {
        if(DATA.has(this) && DATA.get(this).has(property)) {
          return DATA.get(this).get(property)
        }
        if(descriptor.initializer) {
          return this[property] = descriptor.initializer()
        }
      },
      set(value) {
        if(!DATA.has(this)) {
          DATA.set(this, new Map())
        }
        DATA.get(this).set(property, value)
      }
    }
  }
}

exports.queryable = function queryable(knex) {
  return function define(Model) {
    Object.keys(knex).forEach(property => {
      if(typeof knex[property] !== 'function') return

      Model[property] = function proxyMethod(...args) {
        const result = knex[property](...args)
        if(result.table) {
          return result.table(this.tableName)
        }
        return result
      }
    })
  }
}
