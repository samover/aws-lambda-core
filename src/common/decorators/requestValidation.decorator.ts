/* eslint-disable @typescript-eslint/ban-ts-ignore,no-param-reassign,@typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { ValidationClass, ValidatorOptions } from '../../class-validator-wrapper';
import { ValidationError } from '../../errors';
import { Request } from '../../Request';
import { RequestParams } from '../enums';

const getValidationObject = (request: Request, paramType: RequestParams): object => {
    switch (paramType) {
        case RequestParams.BODY:
            return request.getBody();
        case RequestParams.QUERY:
            return request.getQueryParams();
        default:
            return null;
    }
};

export const RequestValidation = (
    Klass: new() => ValidationClass, paramType: RequestParams, options: RequestValidationOptions,
): MethodDecorator => {
    const validatorOptions: ValidatorOptions = options.allowUnknownFields
        ? { whitelist: false, forbidNonWhitelisted: false }
        : { whitelist: true, forbidNonWhitelisted: true };

    return (target, key, descriptor: PropertyDescriptor): any => {
        const originalMethod = descriptor.value;

        descriptor.value = async function (request: Request, ...args: any[]): Promise<any> {
            const klass = new Klass();
            const validationObject = getValidationObject(request, paramType);
            Object.keys(validationObject).forEach((prop: string) => {
                // @ts-ignore
                klass[prop] = validationObject[prop];
            });
            const validationResult = await klass.validate(validatorOptions);
            if (validationResult.length > 0) {
                throw new ValidationError({ validationErrors: validationResult });
            }

            return originalMethod.call(this, request, ...args);
        };
    };
};

export interface RequestValidationOptions {
    allowUnknownFields?: boolean;
}

const createMappingDecorator = (paramType: RequestParams) => (
    klass: new() => ValidationClass, options: RequestValidationOptions = {},
): MethodDecorator => RequestValidation(klass, paramType, options);

export const ValidateBody = createMappingDecorator(RequestParams.BODY);
export const ValidateQuery = createMappingDecorator(RequestParams.QUERY);
