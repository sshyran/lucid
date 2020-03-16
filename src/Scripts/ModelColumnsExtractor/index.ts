/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import * as tsStatic from 'typescript'
import { OrmConfigContract } from '@ioc:Adonis/Lucid/Orm'

/**
 * Exposes the API to extract model columns
 */
export class ModelColumnsExtractor {
  /**
   * Supported decorator names
   */
  private decoratorNames = [
    'column',
    'date',
    'dateTime',
  ]

  constructor (
    private source: string,
    private ts: typeof tsStatic,
    private ormConfig: OrmConfigContract,
  ) {
  }

  /**
   * Extracts and returns the model class from the
   * model file
   */
  private extractModelClass (node: tsStatic.Node): tsStatic.ClassDeclaration | undefined {
    if (this.ts.isClassDeclaration(node)) {
      return node
    }
    return this.ts.forEachChild(node, this.extractModelClass.bind(this))
  }

  /**
   * Returns index of the `@column` decorator index for a given
   * class property member.
   */
  private getColumnDecoratorIndex (property: tsStatic.PropertyDeclaration): number {
    if (!property.decorators || !property.decorators.length) {
      return -1
    }

    return property.decorators.findIndex((decorator) => {
      if (!this.ts.isCallExpression(decorator.expression)) {
        return false
      }

      if (this.ts.isIdentifier(decorator.expression.expression)) {
        return this.decoratorNames.includes(decorator.expression.expression.text)
      }

      if (this.ts.isPropertyAccessExpression(decorator.expression.expression)) {
        return this.ts.isIdentifier(decorator.expression.expression.expression)
        && this.decoratorNames.includes(decorator.expression.expression.expression.text)
        && this.ts.isIdentifier(decorator.expression.expression.name)
        && this.decoratorNames.includes(decorator.expression.expression.name.text)
      }

      return false
    })
  }

  /**
   * Extracts the column name from the decorator arguments
   */
  private extractColumnNameFromArguments (
    args: tsStatic.NodeArray<tsStatic.Expression>
  ): string | undefined {
    for (let arg of args) {
      if (this.ts.isObjectLiteralExpression(arg)) {
        for (let prop of arg.properties) {
          if (
            this.ts.isPropertyAssignment(prop)
            && this.ts.isIdentifier(prop.name)
            && prop.name.text === 'columnName'
            && this.ts.isStringLiteral(prop.initializer)
          ) {
            return prop.initializer.text
          }
        }
      }
    }
  }

  /**
   * Extracts and returns an array of model columns from a [[ClassDeclaration]]
   */
  private extractModelColumns (node: tsStatic.ClassDeclaration) {
    const columns: {
      columnName: string,
      propertyName: string,
      property: tsStatic.PropertyDeclaration,
    }[] = []

    node.members.forEach((member) => {
      /**
       * Member must be a property declaration
       */
      if (!this.ts.isPropertyDeclaration(member)) {
        return
      }

      /**
       * Must have `@column` decorator.
       */
      const columnDecoratorIndex = this.getColumnDecoratorIndex(member)
      if (columnDecoratorIndex === -1) {
        return
      }

      /**
       * Computed properties are not allowed
       */
      if (this.ts.isComputedPropertyName(member.name)) {
        return
      }

      /**
       * At this point the decorator will be a [[CallExpression]]
       */
      const decoratorExpression = member.decorators![columnDecoratorIndex].expression as tsStatic.CallExpression
      const columnName = this.extractColumnNameFromArguments(decoratorExpression.arguments)

      columns.push({
        propertyName: member.name.text,
        columnName: columnName || this.ormConfig.getColumnName({} as any, member.name.text),
        property: member,
      })
    })

    return columns
  }

  /**
   * Extract columns for a model class
   */
  public extract () {
    const ast = tsStatic.createSourceFile('model.ts', this.source.trim(), this.ts.ScriptTarget.ES2019)
    const modelClass = this.ts.forEachChild<tsStatic.ClassDeclaration>(ast, this.extractModelClass.bind(this))
    if (!modelClass) {
      return []
    }
    return this.extractModelColumns(modelClass)
  }
}
