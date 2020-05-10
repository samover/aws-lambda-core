import 'reflect-metadata';
import { ResponseBody } from '../../../src';

import { Request } from '../../Request';
import { ErrorHandler } from '../interfaces';

export const UseErrorHandler = (errorHandler: ErrorHandler): MethodDecorator => (
    target, key, descriptor: PropertyDescriptor,
): void => {
    const originalMethod = descriptor.value;

    // eslint-disable-next-line no-param-reassign
    descriptor.value = async function (request: Request, ...args: any[]): Promise<ResponseBody> {
        try {
            return await originalMethod
                .call(this, request, ...args);
        } catch (e) {
            return errorHandler(e, request, key, this);
        }
    };
};
