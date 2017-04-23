const moment = require('moment')
const {Model, property} = require('..')
const flatten = require('lodash/flattenDeep')

function assign(target, [key, value]) {
  if(!target[key]) target[key] = []
  target[key].push(value)
  return target
}

function toObject(array) {
  return array.reduce(assign, {})
}

function operator(context, op, value) {
  const indent = '\n'+'  '.repeat(context.indent+1)
  return Object.keys(value)
    .map(key => `${key} ${op} ${value[key]}`)
    .join(indent+'AND ')
}


const binding = new Proxy({}, {
  get(target, property) {
    return `:${property}`
  }
})

const sql = {
  select(value, context) {
    const values = flatten(value)
    const indent = '\n'+'  '.repeat(context.indent+1)

    if(values.length > 1) {
      return `SELECT ${indent}${values.join(','+indent)}`
    } else {
      return `SELECT ${values}`
    }
  },

  table(value) {
    return `FROM ${value}`
  },

  join(value, context) {
    return this.innerJoin(value, context)
  },
  innerJoin(value, context) {
    return value
      .map(([table, ...condition]) => {
        var predent = '\n'+'  '.repeat(context.indent)
        var indent = '\n'+'  '.repeat(context.indent+1)
        if(typeof table === 'function') {
          var [table, alias] = table(knex(), binding)
            .toString(context.indent+1)
            .split('AS ')

          table = `(${indent}${table}${predent}) AS ${alias}`
        }
        if(condition.length === 1) {
          return `INNER JOIN ${table} USING(${flatten(condition).join(', ')})`
        } else {
          return `INNER JOIN ${table} ON ${condition.join(' = ')}`
        }
      })
      .join('\n'+'  '.repeat(context.indent))
  },

  where(value, context) {
    const indent = '\n'+'  '.repeat(context.indent+1)

    return 'WHERE ' + value.map(([key, op, value]) => {
      if(typeof key === 'object') {
        return operator(context, '=', key)
      } else if(value !== undefined) {
        return operator(context, op, { [key]: value })
      } else {
        return operator(context, '=', { [key]: value })
      }
    }).join(indent+'AND ')
  },

  groupBy(value, context) {
    const indent = '\n'+'  '.repeat(context.indent+1)
    const values = flatten(value)
    return 'GROUP BY ' + values.join(','+indent)
  },

  orderBy(value, context) {
    const indent = '\n'+'  '.repeat(context.indent+1)
    const values = flatten(value)
    return 'ORDER BY ' + values.join(', '+indent)
  },

  as(value) {
    return 'AS ' + value
  }
}


function buildString(property) {
  return this.query[property] ? sql[property](this.query[property], this) : ''
}

function toSql(object, indent=0) {
  const result = { query: object, indent }

  if(!(object.select || object.insert || object.update || object.delete)) {
    object.select = [['*']]
  }


  result.sql = Object.keys(sql)
    .map(buildString, result)
    .filter(a => a.trim())
    .join('\n'+'  '.repeat(indent))

  return result
}

function knex(value=[], property='table') {


  function apply(...args) {
    return knex(value.concat([ [property, args] ]))
  }

  return new Proxy(apply, {
    get(target, property) {
      if(property === 'toJSON') {
        return indent => toSql(toObject(value), indent)
      }
      if(property === 'toString') {
        return indent => toSql(toObject(value), indent).sql
      }
      return knex(value, property)
    }
  })
}

function database(knex) {
  return function define(Model) {
    return new Proxy(Model, {
      get(target, property) {
        if(property in target) {
          return target[property]
        } else {
          const table = knex.table(target.tableName)
          return table[property]
        }
      }
    })
  }
}

@database(knex())
class RealTeamMembership extends Model {



}


window.RealTeamMembership = RealTeamMembership

function ranked(query, {round, tournament}) {
  return query('real_team_memberships').as('ranked')
    .select([
      'real_team_memberships.id',
      'real_team_memberships.position',
      'real_team_memberships.real_team_id',
      'SUM(score)'
    ])
    .join('real_player_matches', ['real_player_id', 'season_id'])
    .join('match_in_collections', ['real_match_id'])
    .join('tournaments', ['match_collection_id'])
    .join('match_collections', 'match_collections.id', 'match_collection_id')
    .where({
      'real_player_matches.gameweek': round,
      'season_id': 'ANY(season_ids)',
      'tournaments.id': tournament
    })
    .where('score', '>', 0)
    .groupBy([
      'real_team_memberships.id',
      'real_team_memberships.real_team_id',
      'position'
    ])
}
console.log(
  RealTeamMembership.join(ranked, 'id').orderBy('sum DESC').toString()
)
