/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import * as tsStatic from 'typescript'
import { ModelColumnsExtractor } from '../ModelColumnsExtractor'
import { TableColumnsExtractor } from '../TableColumnsExtractor'

type AsyncReturnType<T extends (...args: any) => any> = T extends (...args: any) => Promise<infer U> ? U : any

export class ModelBuilder {
  constructor (
    private existingColumns: ReturnType<ModelColumnsExtractor['extract']>,
    private tableColumns: AsyncReturnType<TableColumnsExtractor['extract']>,
    private ts: typeof tsStatic,
  ) {
  }

  public diff () {
    const add: any[] = []

    this.tableColumns.forEach((tableColumn) => {
      const existingColumn = this.existingColumns.find((column) => column.columnName === tableColumn.columnName)
      if (!existingColumn) {
        add.push(tableColumn)
      } else {
      }
    })
  }

  public transformAst (classDeclaration: tsStatic.ClassDeclaration) {
  }
}
