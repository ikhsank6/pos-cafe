import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export declare class ValidationPipe implements PipeTransform<unknown> {
    transform(value: unknown, { metatype }: ArgumentMetadata): Promise<any>;
    private toValidate;
}
