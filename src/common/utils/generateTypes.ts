require('module-alias/register')

import fs from 'fs'
import { generateTypeScriptTypes } from 'graphql-schema-typescript'

const schema = fs.readFileSync('schema.graphql', { encoding: 'utf8' })

generateTypeScriptTypes(schema, 'src/definitions/schema.d.ts', {
  contextType: 'Context',
  importStatements: ["import { Context } from './index'"]
})
  .then(() => {
    console.log('DONE')
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })