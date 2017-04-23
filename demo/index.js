const Query = require('..')

const query = Query()

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
  query('real_team_memberships')
    .join('ranked', ranked, 'id')
    .order('sum DESC')
    .toString()
)
