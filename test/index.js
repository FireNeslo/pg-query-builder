const Query = require('../lib/query')
const {expect} = require('chai')

function trim(query) {
  return query.toString().trim().replace(/\s+/g, ' ')
}

describe('query', () => {
  const t = Query()


  it('query(table)', () => {
    const query = t('table').toString()

    expect(query).to.equal(`SELECT *\nFROM table`)
  })

  describe('#select', () => {
    it('select(column_a, column_b)', () => {
      const query =  trim(t('table').select('a', 'b'))

      expect(query).to.equal(`SELECT a, b FROM table`)
    })
    it('select([column_a, column_b])', () => {
      const query =  trim(t('table').select(['a', 'b']))

      expect(query).to.equal(`SELECT a, b FROM table`)
    })
  })

  describe('#where', () => {

    it('where(value, equals)', () => {
      const query = trim(t('table').where('a', 'b'))

      expect(query).to.equal(`SELECT * FROM table WHERE a = b`)
    })

    it('where(value, operator, compared)', () => {
      const query = trim(t('table').where('a', '<', 'b'))

      expect(query).to.equal(`SELECT * FROM table WHERE a < b`)
    })

    it('where({value: equals})', () => {
      const query = trim(t('table').where({ a: 'b' }))

      expect(query).to.equal(`SELECT * FROM table WHERE a = b`)
    })

    it('where({values, equals})', () => {
      const query = trim(t('table').where({ a: 'b', c: 'd' }))

      expect(query).to.equal(`SELECT * FROM table WHERE a = b AND c = d`)
    })

  })

  describe('#join', () => {

    it('join(table, using)', () => {
      const query = trim(t('table').join('table_b', 'a'))

      expect(query).to.equal(`SELECT * FROM table INNER JOIN table_b USING(a)`)
    })

    it('join(table, {on: condition})', () => {
      const query = trim(t('table').join('table_b', { a: 'b' }))

      expect(query).to.equal(`SELECT * FROM table INNER JOIN table_b ON a = b`)
    })
    it('join(table, {on, conditions})', () => {
      const query = trim(t('table').join('table_b', { a: 'b', c: 'd' }))
      const result = `SELECT * FROM table INNER JOIN table_b ON a = b AND c = d`

      expect(query).to.equal(result)
    })

    it('join(table, on, condition)', () => {
      const query = trim(t('table').join('table_b', 'a', 'b'))

      expect(query).to.equal(`SELECT * FROM table INNER JOIN table_b ON a = b`)
    })

    it('join(alias, subquery, using)', () => {
      const query = trim(t('table').join('b', t('table_b'), 'a'))
      const result = trim(`
        SELECT * FROM table
        INNER JOIN (
          SELECT * FROM table_b
        ) AS b USING(a)
      `)
      expect(query).to.equal(result)
    })

    it('join(alias, subquery, on, condition)', () => {
      const query = trim(t('table').join('b', t('table_b'), 'a', 'b'))
      const result = trim(`
        SELECT * FROM table
        INNER JOIN (
          SELECT * FROM table_b
        ) AS b ON a = b
      `)
      expect(query).to.equal(result)
    })


    it('join(alias, subquery, {on: condition})', () => {
      const query = trim(t('table').join('b', t('table_b'), {'a': 'b', c: 'd'}))
      const result = trim(`
        SELECT * FROM table
        INNER JOIN (
          SELECT * FROM table_b
        ) AS b ON a = b AND c = d
      `)
      expect(query).to.equal(result)
    })

  })


  describe('#group', () => {

    it('group(column_a, column_b)', () => {
      const query = trim(t('table').group('a', 'b'))
      const result = trim(`SELECT * FROM table GROUP BY a, b`)
      expect(query).to.equal(result)
    })

    it('group([column_a, column_b])', () => {
      const query = trim(t('table').group(['a', 'b']))
      const result = trim(`SELECT * FROM table GROUP BY a, b`)
      expect(query).to.equal(result)
    })

  })

  describe('#order', () => {

    it('order(column_a, column_b)', () => {
      const query = trim(t('table').order('a', 'b'))
      const result = trim(`SELECT * FROM table ORDER BY a, b`)
      expect(query).to.equal(result)
    })

    it('order([column_a, column_b])', () => {
      const query = trim(t('table').order(['a', 'b']))
      const result = trim(`SELECT * FROM table ORDER BY a, b`)
      expect(query).to.equal(result)
    })

  })

})
