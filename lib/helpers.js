const flatten = require('lodash/flattenDeep')

function list(values, indent, join=',\n$') {
  return flatten(values).join(join.replace('$', '  '.repeat(indent)))
}

function joins(values, indent, join) {
  const joins = values.map(value => {
    var [table, expression, field, value] = value

    if(typeof expression === 'function' && !expression.toSQL) {
      expression = expression(query())
    }
    if(expression.toSQL) {
      expression = expression.toSQL(indent+1)
    } else if(typeof expression === 'object' && !Array.isArray(expression)) {
      return `${join} JOIN ${table} ON ${conditions([[expression]], indent+1)}`
    } else if(!field) {
      return `${join} JOIN ${table} USING(${expression})`
    } else if(!value) {
      return `${join} JOIN ${table} ON ${expression} = ${field}`
    }
    var pad = '  '.repeat(indent+1)
    var unpad = '  '.repeat(indent)
    var joins = `${join} JOIN (\n${pad}${expression}\n${unpad}) AS ${table}`

    if(!field) {
      return joins
    } else if(typeof field === 'object' && !Array.isArray(field)) {
      return `${joins}\n${pad}ON ${conditions([[field]], indent+1)}`
    } else if(!value) {
      return `${joins} USING(${field})`
    }
    return `${joins} ON ${field} = ${value}`
  })

  return list(joins, indent, '\n$')
}

function conditions(values, indent) {
  const conditions = values.map(([key, op, val]) => {
    if(typeof key === 'object') {
      return Object.keys(key).map(val => `${val} = ${key[val]}`)
    } else if(val === undefined) {
      return `${key} = ${op}`
    } else {
      return `${key} ${op} ${val}`
    }
  })
  return list(conditions, indent, '\n$AND ')
}

Object.assign(exports, { list, joins, conditions })
