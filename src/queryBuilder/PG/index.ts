import { AbstractQueryBuilder, AggregationFunctionsRegex, GroupByClause, QueryMimeType, extractAggrFnComponents, whereArgs } from "../base";
import { Result, result } from "../../lib/results";
import { FromUndefinedError, NotInGroupBySelectionError, OrderByNotInGroupByError } from "../errors";

export class PGQueryBuilder extends AbstractQueryBuilder{
    private connection: any;
    
    constructor(connection: any){
        super();
        this.connection = connection;
    }

    private constructWhereClause(whereArgs: whereArgs[]){
        return whereArgs.map( col => {
            const value = col.value === null && col.operator !== '!=' ? 'NULL' : col.value === null && col.operator === "!=" ? "NOT NULL" : typeof col.value === 'string' && col.operator !== "~=" ? `'${col.value}'` : `${col.value}`;
            const operator = col.value === null && (col.operator === '=' || col.operator === '!=') ? "IS" : col.operator;

            const columnName =  AggregationFunctionsRegex.test(col.columnName) ? col.columnName: `"${col.columnName}"`;

            if(col.operator === '~='){
                return `lower(cast(${columnName} as varchar)) SIMILAR TO '%${value.toString().toLowerCase().replace(/\s+/g,'%')}%'`;
            }

            else return `${columnName} ${operator} ${value}`
        }).join(" AND ");
    }

    compile<E extends Error = NotInGroupBySelectionError | FromUndefinedError>(): Result<[Buffer, QueryMimeType], E> {
        //1. if no from Table give error.
        if(!this.fromTable) return result.err(new FromUndefinedError());

        //2. find the groupBy columns
        const groupColumns = new Set(this.groupByClauses.map(v => v.columnName.toLowerCase()));

        /*
        3. see if the select columns contains columns that are not in "groupColumns"
           a. If groupBy is being used then groupColums in not empty hence only the groupBy columns can be selected.
           b. if groupBy is not being used then groupColumns is empty, hence any columns can be used.
        */
        const nonGroupColumns = this.selectColumns.filter( col => {
            if( col === '*') return false;
            col = col.toLowerCase();
            const aggrFnResult = extractAggrFnComponents(col);

            if(!aggrFnResult){
                return groupColumns.size > 0 && !groupColumns.has(col);
            }

            if(aggrFnResult.column === "*") return false;

            return groupColumns.size > 0 && !groupColumns.has(aggrFnResult.column);
        })

        //If non group columns exist return error
        if(nonGroupColumns.length > 0) return result.err(new NotInGroupBySelectionError(nonGroupColumns));

        
        //4. Check if the order by columns exist in Group by or not
        const orderByColumns = this.orderByClauses.map(v => v.columnName);
        const nonGroupByOrders = orderByColumns.filter( col => this.groupByClauses.length > 0 && col !== "*" && !groupColumns.has(col));

        if(nonGroupByOrders.length > 0) return result.err(new OrderByNotInGroupByError(this.orderByClauses));

        //5. Build Select Statement.
        const selectClause = this.selectColumns.length === 0 ? "*" : this.selectColumns.map(v => {
            const aggFnRes = extractAggrFnComponents(v);
            if(!aggFnRes) return v === "*" ? "*" : `"${v}"`

            return aggFnRes.column === "*" ? `${aggFnRes.fn}(${aggFnRes.column})` : `${aggFnRes.fn}("${aggFnRes.column}")`;
        })

        //6. Build where Clause
        const whereClause = this.whereColumns.length === 0 ? '' : "WHERE" + this.constructWhereClause(this.whereColumns);

        //7. Construct Having Args
        const havingArgs = this.groupByClauses.filter((v): v is Required<GroupByClause> => v.havingArgs !== undefined);

        //8. Construct groupBy Clause
        const groupByClause = this.groupByClauses.length === 0 ? "" : 'GROUP BY ' + this.groupByClauses.map(v => `"${v.columnName}"`).join(", ");

        //9. Construct having Clause
        const havingClause = havingArgs.length === 0 ? '' : 'HAVING ' + this.constructWhereClause(havingArgs.map(v => ({columnName:  v.columnName, operator: v.havingArgs.operator, value: v.havingArgs.value})));

        //10. Construct limit clause
        const limitClause = this.limitVal !== undefined ? `LIMIT ${this.limitVal}` : '';

        //11. Construct OrderBy Clause
        const orderByClause = this.orderByClauses.length > 0 ? 'ORDER BY ' + this.orderByClauses.map(v => `"${v.columnName}" ${v.sortDirection}`).join(", ") : '';

        //12. Construct Offset
        const offsetClause =  `OFFSET ${this.offsetVal}`;

        //13. Construct SQL statement
        const sql = `SELECT ${selectClause} FROM ${this.fromTable} ${whereClause} ${groupByClause} ${havingClause} ${orderByClause} ${offsetClause} ${limitClause}`.replace(/\s+/g,' ');

        return result.ok([Buffer.from(sql.trim()), 'text/plain']);
    }

    execute<T extends Record<string, any> = Record<string, any>, E extends Error = Error>(): Promise<Result<T[], E>> {
        
    }

}