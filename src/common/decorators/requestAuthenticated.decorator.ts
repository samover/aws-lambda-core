import 'reflect-metadata';

import { ROUTES_METADATA } from '../constants';

export const Authenticated = (isAuthenticated = true): MethodDecorator => (
    target, key, descriptor: PropertyDescriptor,
): PropertyDescriptor => {
    const routes = Reflect.getMetadata(ROUTES_METADATA, target) || {};
    if (!routes[key]) { routes[key] = {}; }
    routes[key].authenticated = isAuthenticated;
    Reflect.defineMetadata(ROUTES_METADATA, routes, target);
    return descriptor;
};
