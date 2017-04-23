const Query = require('..')

const query = Query()

function attachments(_) {
  return query('posts')
    .select([
      'posts.id',
      'posts.author_id',
      'posts.attachment_id',
      'SUM(attachements.size)'
    ])
    .join('attachements', ['user_id'])
    .where({
      'user_id': 15,
      'attachements.type': 'image'
    })
    .where('attachements.size', '>', 0)
    .group('attachements.type')
}

console.log(
  query('posts')
    .join('attachments', attachments, 'id')
    .order('sum DESC')
    .toString()
)
