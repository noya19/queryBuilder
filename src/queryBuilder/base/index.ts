import { NonEmptyArray } from '../../type-utils/common';
import { Result } from '../../lib/results';

export type QueryMimeType =
  | "application/octet-stream"
  | "application/json"
  | "application/ld+json"
  | "text/plain"
  | "application/xml";

type QueryOperator = '=' | '!=' | '>=' | '>' | '<=' | '<' | '~=';

type whereArgs = {
  columnName: string;
  value: string | number | null;
  operator: QueryOperator;
};

type GroupByClause = {
  columnName: string;
  havingArgs?: Pick<whereArgs, 'operator' | 'value'>;
};

type SortDirection = 'ASC' | 'DESC';

type OrderByClause = {
  columnName: string;
  sortDirection: SortDirection;
};

export abstract class AbstractQueryBuilder {
  fromTable: string | undefined;
  selectColumns: string[];
  whereColumns: whereArgs[];
  groupByClauses: GroupByClause[];
  offsetVal: number | undefined;
  limitVal: number | undefined;
  orderByClauses: OrderByClause[];

  constructor() {
    this.selectColumns = [];
    this.whereColumns = [];
    this.groupByClauses = [];
    this.orderByClauses = [];
    this.offsetVal = 0;
  }

  from(tableName: string) {
    this.fromTable = tableName;
    return this;
  }

  select(args: NonEmptyArray<string>) {
    this.selectColumns = args;
    return this;
  }

  where(
    colName: string,
    value: string | null | number,
    operator: QueryOperator
  ) {
    this.whereColumns.push({
      columnName: colName,
      value: value,
      operator: operator,
    });
  }

  groupBy(colName: string, havingArgs?: Pick<whereArgs, 'operator' | 'value'>) {
    this.groupByClauses.push({ columnName: colName, havingArgs });
  }

  orderBy(colName: string, sortDirection: SortDirection) {
    this.orderByClauses.push({
      columnName: colName,
      sortDirection,
    });
  }

  limit(lim: number) {
    this.limitVal = lim;
  }

  offset(offset: number) {
    this.offsetVal = offset;
  }

  abstract compile<E extends Error>(): Result<[Buffer, QueryMimeType], E>;

  abstract execute<
    T extends Record<string, any> = Record<string, any>,
    E extends Error = Error
    >(): Promise<Result<T[], E>>

}
