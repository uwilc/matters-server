const { baseDown } = require('../utils')

const table = 'article_read'

exports.up = async (knex) => {
  await knex('entity_type').insert({ table })
  await knex.schema.createTable(table, (t) => {
    t.bigIncrements('id').primary()
    t.uuid('uuid').notNullable().unique()
    t.bigInteger('user_id').unsigned()
    t.bigInteger('article_id').unsigned().notNullable()
    t.boolean('archived').defaultTo(false)
    t.timestamp('created_at').defaultTo(knex.fn.now())

    // Setup foreign key
    t.foreign('user_id').references('id').inTable('user')
    t.foreign('article_id').references('id').inTable('article')
  })
}

exports.down = baseDown(table)
