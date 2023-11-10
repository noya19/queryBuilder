import { describe, expect, test } from 'vitest';
import { PGQueryBuilder } from '../src/queryBuilder/PG';
import { FromUndefinedError } from '../src/queryBuilder/errors';
import { Client } from 'pg';
import { inspect } from 'node:util'

describe('Test on the Postgres Query Builder', async () => {
  const config = {
    host: 'localhost',
    database: 'northwind',
    port: 55432,
    user: 'postgres',
    password: 'postgres',
  };

  const con = new Client(config);
  await con.connect();

  test('Should return a FromUndefinedError when a from method is not chained', () => {
    const queryBuilder = new PGQueryBuilder(con);

    const [_, err] = queryBuilder.compile();
    expect(err instanceof FromUndefinedError).toBeTruthy();
  });

  test('Select All from Table', () => {
    const queryBuilder = new PGQueryBuilder(con);

    const [result] = queryBuilder
      .from('"northwind.public.employees"')
      .compile();

    const outputSQL = `SELECT * FROM "northwind.public.employees" OFFSET 0`;

    if (result) {
      const sql = result[0].toString('utf-8');
      expect(sql === outputSQL).toBeTruthy();
    } else {
      expect(true).toEqual(false);
    }
  });

  test('Select All from Table - Explicit', () => {
    const queryBuilder = new PGQueryBuilder(con);

    const [result] = queryBuilder
      .from('"northwind.public.employees"')
      .select(['*'])
      .compile();

    const outputSQL = `SELECT * FROM "northwind.public.employees" OFFSET 0`;

    if (result) {
      const sql = result[0].toString('utf-8');
      expect(sql === outputSQL).toBeTruthy();
    } else {
      expect(true).toEqual(false);
    }
  });
  
  test('Select All with Limit and offset', () => {
    const queryBuilder = new PGQueryBuilder(con);

    const [result] = queryBuilder
      .from('"northwind.public.employees"')
      .offset(0)
      .limit(100)
      .compile();

    const outputSQL = `SELECT * FROM "northwind.public.employees" OFFSET 0 LIMIT 100`;
    
    if (result) {
      const sql = result[0].toString('utf-8');
      expect(sql === outputSQL).toBeTruthy();
    } else {
      expect(true).toEqual(false);
    }
  });

  test('Select with Limit and offset and order by', () => {
    const queryBuilder = new PGQueryBuilder(con);

    const [result] = queryBuilder
      .from('"northwind.public.employees"')
      .orderBy("employee id", "ASC")
      .orderBy("city", "DESC")
      .offset(0)
      .limit(100)
      .compile();

    const outputSQL = `SELECT * FROM "northwind.public.employees" ORDER BY "employee id" ASC, "city" DESC OFFSET 0 LIMIT 100`;
    
    if (result) {
      const sql = result[0].toString('utf-8');
      expect(sql === outputSQL).toBeTruthy();
    } else {
      expect(true).toEqual(false);
    }
  });

  test('Select columns from Table Query', () => {
    const queryBuilder = new PGQueryBuilder(con);

    const [result] = queryBuilder
      .from('northwind.public.employees')
      .select(["employee id", "city"])
      .offset(0)
      .limit(100)
      .compile();

    const outputSQL = `SELECT "employee id", "city" FROM northwind.public.employees OFFSET 0 LIMIT 100`;
    
    if (result) {
      const sql = result[0].toString('utf-8');
      expect(sql === outputSQL).toBeTruthy();
    } else {
      expect(true).toEqual(false);
    }
  });

  test('Select columns from Table with where clause - numerical', () => {
    const queryBuilder = new PGQueryBuilder(con);

    const [result] = queryBuilder
      .from('northwind.public.employees')
      .select(["employee id", "city"])
      .where("employee id", 5, ">=")
      .compile();

    const outputSQL = `SELECT "employee id", "city" FROM northwind.public.employees WHERE "employee id" >= 5 OFFSET 0`;
    
    if (result) {
      const sql = result[0].toString('utf-8');
    //   console.log(sql);
      expect(sql === outputSQL).toBeTruthy();
    } else {
      expect(true).toEqual(false);
    }
  });

  test('Select columns from Table with where clause - null', () => {
    const queryBuilder = new PGQueryBuilder(con);

    const [result] = queryBuilder
      .from('northwind.public.employees')
      .select(["employee id", "city"])
      .where("employee id", null, "!=")
      .compile();

    const outputSQL = `SELECT "employee id", "city" FROM northwind.public.employees WHERE "employee id" IS NOT NULL OFFSET 0`;
    
    if (result) {
      const sql = result[0].toString('utf-8');
    //   console.log(sql);
      expect(sql === outputSQL).toBeTruthy();
    } else {
      expect(true).toEqual(false);
    }
  });

  test("execute method should be able to return data from postgres", async () => {
    const queryBuilder = new PGQueryBuilder(con);
    
    const [result, err] = await queryBuilder
    .from('northwind.public.employees')
    .select(["employee_id", "city"])
    .where("employee_id", 5, ">=")
    .limit(10)
    .execute();

    const res = result as any;
    console.log(inspect(res.rows, true, null, true));
    expect(result).toBeTruthy();
  })
});
