/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import test from 'japa'
import { setup, cleanup, getDb } from '../../test-helpers'
import { TableColumnsExtractor } from '../../src/Scripts/TableColumnsExtractor'

let db: ReturnType<typeof getDb>

test.group('TableColumnsExtractor', (group) => {
  group.before(async () => {
    await setup()
    db = getDb()
  })

  group.after(async () => {
    await cleanup()
  })

  group.afterEach(async () => {
    await db.connection().schema.dropTableIfExists('scripting_users')
  })

  test('extra columns decoarated with the @column decorator', async (assert) => {
    await db.connection().schema.createTable('scripting_users', (table) => {
      table.bigIncrements('id').primary()
      table.string('username').notNullable()
      table.date('dob')
      table.decimal('score')
      table.float('coords')
      table.boolean('is_admin').defaultTo(1)
      table.enu('account_status', ['ACTIVE', 'PENDING'])
      table.text('bio').nullable()
      table.timestamps()
    })

    const extractor = new TableColumnsExtractor('scripting_users', db.connection())
    const columns = await extractor.extract()
    assert.deepEqual(columns, [
      {
        type: 'integer' as const,
        columnName: 'id',
        nullable: false,
      },
      {
        type: 'string' as const,
        columnName: 'username',
        nullable: false,
      },
      {
        type: 'date' as const,
        columnName: 'dob',
        nullable: true,
      },
      {
        type: 'integer' as const,
        columnName: 'score',
        nullable: true,
      },
      {
        type: 'integer' as const,
        columnName: 'coords',
        nullable: true,
      },
      {
        type: 'boolean' as const,
        columnName: 'is_admin',
        nullable: true,
      },
      {
        type: 'string' as const,
        columnName: 'account_status',
        nullable: true,
      },
      {
        type: 'string' as const,
        columnName: 'bio',
        nullable: true,
      },
      {
        type: 'datetime' as const,
        columnName: 'created_at',
        nullable: true,
      },
      {
        type: 'datetime' as const,
        columnName: 'updated_at',
        nullable: true,
      },
    ])
  })
})
