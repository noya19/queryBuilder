import { AbstractQueryBuilder, QueryMimeType } from "../base";
import { Result } from "../../lib/results";

export class PGQueryBuilder extends AbstractQueryBuilder{
    private connection: any;
    
    constructor(connection: any){
        super();
        this.connection = connection;
    }

    compile<E extends Error>(): Result<[Buffer, QueryMimeType], E> {
        
    }

    execute<T extends Record<string, any> = Record<string, any>, E extends Error = Error>(): Promise<Result<T[], E>> {
        
    }

}