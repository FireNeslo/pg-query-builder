const METHODS = require('./methods')
const {list, conditions, joins} = require('./helpers')

class QueryGenerator {
  constructor(query, indent=0) {
    if(!(query.update || query.delete || query.select || query.insert)) {
      query.select = [['*']]
    }
    this.query = query
    this.indent = indent
  }
  select(value) {
    return 'SELECT ' + list(value, this.indent+1)
  }
  from(value) {
    return 'FROM ' + list(value, this.indent+1)
  }
  where(values) {
    return 'WHERE ' + conditions(values, this.indent+1)
  }
  join(values) {
    return joins(values, this.indent, 'INNER')
  }
  innerJoin(values) {
    return this.join(values)
  }
  leftJoin(values) {
    return this.join(values)
  }
  outerJoin(values) {
    return joins(values, this.indent, 'OUTER')
  }
  crossJoin(values) {
    return joins(values, this.indent, 'CROSS')
  }
  from(value) {
    return 'FROM ' + list(value, this.indent+1)
  }
  group(value) {
    return 'GROUP BY ' + list(value, this.indent+1)
  }
  order(value) {
    return 'ORDER BY ' + list(value, this.indent+1)
  }
  toJSON(indent) {
    return Object.assign({ sql:  this.toString(indent) }, this.query)
  }
  toSQL(indent) {
    return this.toString(indent)
  }
  toString(indent=this.indent) {
    this.indent = indent

    return METHODS
      .map(action => this.query[action] ? this[action](this.query[action]) : '')
      .filter(value => value.trim())
      .join('\n'+'  '.repeat(this.indent))
  }
}

module.exports = QueryGenerator
