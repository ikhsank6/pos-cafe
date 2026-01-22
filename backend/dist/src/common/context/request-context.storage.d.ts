import { AsyncLocalStorage } from 'async_hooks';
export interface RequestContext {
    userId?: number;
    userName?: string;
    userEmail?: string;
}
export declare const contextStorage: AsyncLocalStorage<RequestContext>;
export declare function getRequestContext(): RequestContext | undefined;
