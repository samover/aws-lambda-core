import 'reflect-metadata';

import { METHOD, PATH, ROUTES_METADATA } from '../constants';
import { RequestMethod } from '../enums';
import { RequestMappingConfig } from '../interfaces';

const defaultRequestConfig = {
    [PATH]: '/',
    [METHOD]: RequestMethod.GET,
};

export const RequestMapping = (config: RequestMappingConfig = defaultRequestConfig): MethodDecorator => {
    const pathConfig = config[PATH];
    const path = pathConfig && pathConfig.length ? pathConfig : defaultRequestConfig[PATH];
    const requestMethod = config[METHOD] || defaultRequestConfig[METHOD];

    return (target, key, descriptor: PropertyDescriptor): PropertyDescriptor => {
        const routes = Reflect.getMetadata(ROUTES_METADATA, target) || {};
        routes[key] = {
            authenticated: routes[key] ? routes[key].authenticated : false,
            method: requestMethod,
            path,
            useSession: routes[key] ? routes[key].useSession : false,
        };
        Reflect.defineMetadata(ROUTES_METADATA, routes, target);
        return descriptor;
    };
};

const createMappingDecorator = (method: RequestMethod) => (
    path?: string | string[],
): MethodDecorator => RequestMapping({ [PATH]: path, [METHOD]: method });

export const Get = createMappingDecorator(RequestMethod.GET);
export const Post = createMappingDecorator(RequestMethod.POST);
export const Put = createMappingDecorator(RequestMethod.PUT);
export const Delete = createMappingDecorator(RequestMethod.DELETE);
