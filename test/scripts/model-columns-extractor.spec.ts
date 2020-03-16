/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import test from 'japa'
import ts from 'typescript'
import { OrmConfig } from '../../src/Orm/Config'
import { ModelColumnsExtractor } from '../../src/Scripts/ModelColumnsExtractor'

test.group('ModelColumnsExtractor', () => {
  test('extra columns decoarated with the @column decorator', (assert) => {
    const source = `import { column } from '../../src/Orm/Decorators'

    class User {
      @column()
      public username: string

      @column()
      public email: string
    }`

    const columns = new ModelColumnsExtractor(source, ts, OrmConfig).extract()
    assert.deepEqual(columns.map(({ columnName, propertyName }) => {
      return { columnName, propertyName }
    }), [
      {
        columnName: 'username',
        propertyName: 'username',
      },
      {
        columnName: 'email',
        propertyName: 'email',
      },
    ])
  })

  test('extra columns decoarated with the @column.date or dateTime decorator', (assert) => {
    const source = `import { column } from '../../src/Orm/Decorators'

    class User {
      @column()
      public username: string

      @column.date()
      public dob: string

      @column.dateTime()
      public createdAt: string
    }`

    const columns = new ModelColumnsExtractor(source, ts, OrmConfig).extract()
    assert.deepEqual(columns.map(({ columnName, propertyName }) => {
      return { columnName, propertyName }
    }), [
      {
        columnName: 'username',
        propertyName: 'username',
      },
      {
        columnName: 'dob',
        propertyName: 'dob',
      },
      {
        columnName: 'created_at',
        propertyName: 'createdAt',
      },
    ])
  })

  test('consider hardcoded column name', (assert) => {
    const source = `import { column } from '../../src/Orm/Decorators'

    class User {
      @column()
      public username: string

      @column.date({ columnName: 'user_dob' })
      public dob: string

      @column.dateTime()
      public createdAt: string
    }`

    const columns = new ModelColumnsExtractor(source, ts, OrmConfig).extract()
    assert.deepEqual(columns.map(({ columnName, propertyName }) => {
      return { columnName, propertyName }
    }), [
      {
        columnName: 'username',
        propertyName: 'username',
      },
      {
        columnName: 'user_dob',
        propertyName: 'dob',
      },
      {
        columnName: 'created_at',
        propertyName: 'createdAt',
      },
    ])
  })
})
