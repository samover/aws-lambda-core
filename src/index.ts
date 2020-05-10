import 'reflect-metadata';
import * as errors from './errors'
import * as validation from './class-validator-wrapper';

export { LambdaEntryPoint } from './EntryPoint';
export {
    Handler, Routes, HandlerAction, RouteConfig, Middleware,
} from './Handler';
export { Request, LambdaProxyEvent, LambdaIdentity, LambdaProxyContext } from './Request';
export { Response } from './Response';
export { ResponseBody, ResponseBodyInput } from './ResponseBody';
export { isAuthenticated } from './middlewares';
export { HttpMethod } from './common/types';
export {
    RequestMapping,
    Authenticated,
    Get,
    Put,
    Post,
    Delete,
    ValidateQuery,
    ValidateBody,
    RequestValidation,
    RequestValidationOptions,
} from './common/decorators';
export { ContentType, RequestMethod } from './common/enums';
export { ErrorHandler } from './common/interfaces';
export const apiErrors = errors;
export const classValidation = validation;
