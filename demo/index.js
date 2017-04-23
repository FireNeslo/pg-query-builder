const moment = require('moment')
const {Model, property} = require('..')
const Query = require('../lib/query')
const flatten = require('lodash/flattenDeep')

const query = Query()

function database(knex) {
  return function define(Model) {
    return new Proxy(Model, {
      get(target, property) {
        if(property in target) {
          return target[property]
        } else {
          return query(target.tableName)[property]
        }
      }
    })
  }
}

@database(query)
class RealTeamMembership extends Model {



}


window.RealTeamMembership = RealTeamMembership

function ranked(_) {
  return query('real_team_memberships')
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
      'real_player_matches.gameweek': 15,
      'season_id': 'ANY(season_ids)',
      'tournaments.id': 1337
    })
    .where('score', '>', 0)
    .group([
      'real_team_memberships.id',
      'real_team_memberships.real_team_id',
      'position'
    ])
}
console.log(
  RealTeamMembership.join('ranked', ranked, 'id').order('sum DESC').toString()
)
