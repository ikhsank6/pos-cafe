import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../logger/logger.service';
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger;
    private readonly configService;
    private readonly isDebug;
    constructor(logger: LoggerService, configService: ConfigService);
    catch(exception: unknown, host: ArgumentsHost): void;
}
