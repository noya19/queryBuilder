export type Result<T, E extends Error> = [T, null] | [null,  E]

export function intoResult<
    T extends (...args: any[]) => unknown,
    E extends Error
>(cb: T, ...args: Parameters<T>): Result<ReturnType<T>,E>{
    try{
        const res = cb(...args) as ReturnType<T>;
        return [res, null]
    }catch(e){
        const err = e as E;
        return [null, err]
    }
}

export async function intoResultAsync<
    T extends (...args: any[]) => Promise<unknown>,
    E extends Error
>(cb: T, ...args: Parameters<T>): Promise<Result<Awaited<ReturnType<T>>, E>>{
    try{
        const res = (await cb(...args)) as Awaited<ReturnType<T>>;
        return [res, null]
    }catch(e){
        const err = e as E;
        return [null, err]
    }
}

export const result = {
    ok<T, E extends Error>(val: T){
        return [val, null] as Result<T, E>; 
    },
    
    err<T,DE extends Error, E extends Error = Error>(err: E) {
        return [null, err as unknown as DE] as Result<T,DE>
    } 
}