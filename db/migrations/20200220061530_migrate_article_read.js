const lodash = require('lodash')
const uuid = require('uuid')

const source = 'article_read'
const target = 'article_read_count'

const size = 300

exports.up = async knex => {
  const querySource = knex(source)
    .select('user_id', 'article_id')
    .where({ archived: false })
    .groupBy('user_id', 'article_id')

  // get total count of collapesed records
  const temp = await knex(source)
    .from(querySource.as('source'))
    .count()
    .first()
  const count = parseInt(temp ? temp.count : '0', 10)
  console.log('source count', count)

  // process data batch by batch
  let offset = 0
  while (offset < count) {
    const data = await knex(source)
      .select('user_id', 'article_id')
      .where({ archived: false })
      .groupBy('user_id', 'article_id')
      .count('article_id', { as: 'count' })
      .limit(size)
      .offset(offset)
      .orderBy([
        { column: 'user_id', order: 'asc' },
        { column: 'article_id', order: 'asc' }
      ])

    const updateData = data.map(item => ({ uuid: uuid.v4(), ...item }))
    const processedData = await knex
      .batchInsert(target, updateData, size)
      .returning('id')

    offset = offset + size
    console.log(
      'batch',
      lodash.padStart(offset, 20, ' '),
      lodash.padStart(processedData.length, 5, ' ')
    )
  }

  const result = await knex(target)
    .count()
    .first()
  const check = parseInt(result ? result.count : '0', 10)
  console.log('migrated count', check)
}

exports.down = async knex => {
  await knex(target).truncate()
}
