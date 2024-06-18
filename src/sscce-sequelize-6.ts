import { DataTypes, Model } from 'sequelize';
import { createSequelize6Instance } from '../dev/create-sequelize-instance';
import { expect } from 'chai';
import sinon from 'sinon';

// if your issue is dialect specific, remove the dialects you don't need to test on.
export const testingOnDialects = new Set(['mssql', 'sqlite', 'mysql', 'mariadb', 'postgres', 'postgres-native']);

// You can delete this file if you don't want your SSCCE to be tested against Sequelize 6

// Your SSCCE goes inside this function.
export async function run() {
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
    createdAt: 'timestamp',
    updatedAt: false
  });

  // You can use sinon and chai assertions directly in your SSCCE.
  const spy = sinon.spy();
  sequelize.afterBulkSync(() => spy());
  await sequelize.sync({ force: false, alter: true });
  expect(spy).to.have.been.called;

  await Foo.create({value: 'Hello World 1!'});
  await Foo.create({value: 'Hello World 2!'});
  const result1 = await Foo.findAll();
  console.log('Result 1: ')
  result1.map(r => console.log(r.customId, r.value, r.timestamp));

  await Foo.destroy({where: {custom_id: 2}});
  const result2 = await Foo.findAll();
  console.log('Result 2: ')
  result2.map(r => console.log(r.customId, r.value, r.timestamp));

  await Foo.create({value: 'Hello World 3!'});
  const result3 = await Foo.findAll();
  console.log('Result 3: ')
  result3.map(r => console.log(r.customId, r.value, r.timestamp));

  await sequelize.close();
}
