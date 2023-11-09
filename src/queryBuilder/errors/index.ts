import { OrderByClause } from '../base/index'

export class NoConnectionProvidedError extends Error {

    cause: string;

    constructor() {
        super(`(NoConnectionProvidedError) Inovation of the 'execute' method is aborted as a ConnectionPool was not supplied to the QueryBuilder`);
        this.name = 'NoConnectionProvidedError';
        this.cause = `Inovation of the 'execute' method is aborted as a ConnectionPool was not supplied to the QueryBuilder`;
    }
}

export class FromUndefinedError extends Error {
    cause: string;

    constructor(message: string = '(FromUndefinedError) from must be specified before calling compile on the QueryBuilder') {
        super(message);
        this.name = 'FromUndefinedError';
        this.cause = 'The Table name must be specified in the QueryBuilder'
    }
}

export class NotInGroupBySelectionError extends Error {

    cause: string;

    errantColumns: string[];

    constructor(columns: string[]) {
        super(`(NotInGroupBySelection) The following columns included in the select clause are not present in the group by clause: ${columns.join(",")}`);
        this.name = 'NotInGroupBySelection';
        this.cause = 'The following columns included in the select clause are not present in the group by clause: '+columns.join(",");
        this.errantColumns = columns
    }
}

export class OrderByNotInGroupByError extends Error {

    cause: string;

    errantClauses: OrderByClause[];

    constructor(clauses: OrderByClause[]) {
        super(`(OrderByNotInGroupByError) The following order by clauses include columns not present in the group by clause: ${clauses.map(v => `${v.columnName} ${v.sortDirection}`).join(", ")}`);
        this.name = "OrderByNotInGroupByError";
        this.cause = `OrderByNotInGroupByError: The following order by clauses include columns not present in the group by clause: ${clauses.map(v => `${v.columnName} ${v.sortDirection}`).join(", ")}`;
        this.errantClauses = clauses;
    }
}