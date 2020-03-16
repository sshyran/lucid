/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { join } from 'path'
import { BaseCommand, args, flags } from '@adonisjs/ace'
import { ExtractTableColumns } from '../src/Scripts/ExtractTableColumns'

export default class MakeModel extends BaseCommand {
  public static commandName = 'make:model'
  public static description = 'Make a new Lucid model'

  /**
   * The name of the model file.
   */
  @args.string({ description: 'Name of the model class' })
  public name: string

  @flags.string({ description: 'The table from which to derive the model columns' })
  public table: string

  public static settings = {
    loadApp: true,
  }

  /**
   * Execute command
   */
  public async handle (): Promise<void> {
    if (!this.table) {
      const isCreated = await this.prompt.confirm('Do you have database table created for this model?')
      if (isCreated) {
        this.table = await this.prompt.ask('Enter the database table name')
      }
    }

    const stub = join(
      __dirname,
      '..',
      'templates',
      'model.txt',
    )

    const path = this.application.resolveNamespaceDirectory('models')
    let columns: any[] = []

    if (this.table) {
      const { default: Database } = await import('@ioc:Adonis/Lucid/Database')
      columns = await new ExtractTableColumns(this.table, Database.connection()).extract()
    }

    this
      .generator
      .addFile(this.name, { pattern: 'pascalcase', form: 'singular' })
      .stub(stub)
      .destinationDir(path || 'app/Models')
      .appRoot(this.application.cliCwd || this.application.appRoot)

    await this.generator.run()
  }
}
