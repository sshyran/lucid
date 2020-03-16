/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { ColumnInfo } from 'knex'
import { QueryClientContract } from '@ioc:Adonis/Lucid/Database'

export type ColumnTypes = 'string' |
'integer' |
'date' |
'datetime' |
'enum' |
'boolean'

/**
 * Exposes the API to extract columns for a given table
 */
export class TableColumnsExtractor {
  /**
   * Database types to normalized types
   */
  private types: { [key: string]: ColumnTypes } = {
    'real': 'integer',
    'float': 'integer',
    'decimal': 'integer',
    'tinyint': 'boolean',
    'numeric': 'integer',
    'bigint': 'integer',
    'integer': 'integer',
    'character varying': 'string',
    'boolean': 'boolean',
    'USER-DEFINED': 'string',
    'varchar': 'string',
    'date': 'date',
    'text': 'string',
    'datetime': 'datetime',
    'timestamp with time zone': 'datetime',
  }

  constructor (
    private tableName: string,
    private client: QueryClientContract,
  ) {
  }

  /**
   * Normalize column
   */
  private normalizeColumn (columnName: string, column: ColumnInfo) {
    const type = this.types[column.type] || 'string'
    return {
      type: type,
      nullable: column.nullable,
      columnName,
    }
  }

  /**
   * Extracts columns from a given table name
   */
  public async extract () {
    const columns = await this.client.columnsInfo(this.tableName)
    return Object.keys(columns).map((columnName) => {
      return this.normalizeColumn(columnName, columns[columnName])
    })
  }
}
