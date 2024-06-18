import { DataTypes, Model } from 'sequelize';
import { createSequelize6Instance } from '../dev/create-sequelize-instance';
import { expect } from 'chai';
import sinon from 'sinon';

// if your issue is dialect specific, remove the dialects you don't need to test on.
export const testingOnDialects = new Set(['mssql', 'sqlite', 'mysql', 'mariadb', 'postgres', 'postgres-native']);

// You can delete this file if you don't want your SSCCE to be tested against Sequelize 6

async function runOnce(force:boolean) {
  // This function should be used instead of `new Sequelize()`.
  // It applies the config for your SSCCE to work on CI.
  const sequelize = createSequelize6Instance({
    logQueryParameters: true,
    benchmark: true,
    define: {
      // For less clutter in the SSCCE
      timestamps: false,
    },
    storage: 'example.db'
  });

  class Foo extends Model {
    private custom_id!: number;
    value!: string;
    timestamp!: Date;
    get customId() {
      return this.custom_id;
    }
  }

  Foo.init({
    custom_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    value: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    }
  }, {
    sequelize,
    tableName: 'Foo',
    freezeTableName: true,
    updatedAt: false
  });

  // You can use sinon and chai assertions directly in your SSCCE.
  const spy = sinon.spy();
  sequelize.afterBulkSync(() => spy());
  await sequelize.sync({ force, alter: true }); // get force from the parameter
  expect(spy).to.have.been.called;

  await sequelize.close();
}


// Your SSCCE goes inside this function.
export async function run() {
  // Run once with force set to true to force deleting the table
  await runOnce(true);
  // after this the schema is:
  // CREATE TABLE IF NOT EXISTS `Foo` (`custom_id` INTEGER PRIMARY KEY AUTOINCREMENT, `value` VARCHAR(1024) NOT NULL, `timestamp` DATETIME NOT NULL);

  // Run once with force set to false to keep the table
  await runOnce(false);
  // after this the schema is:
  // CREATE TABLE IF NOT EXISTS `Foo` (`custom_id` INTEGER PRIMARY KEY, `value` VARCHAR(1024) NOT NULL, `timestamp` DATETIME NOT NULL);
}
