import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerStorage } from '@nestjs/throttler';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
export declare class AuthThrottlerGuard extends ThrottlerGuard {
    protected errorMessage: string;
    private throttlerOptions;
    constructor(options: ThrottlerModuleOptions, storageService: ThrottlerStorage, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
    protected getTracker(req: Record<string, any>): Promise<string>;
}
