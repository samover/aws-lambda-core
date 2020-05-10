import { UnauthorizedError } from '../errors';
import { LOGGER } from '../utils/logger';
import { HandlerAction, Middleware, Request } from '../index';

/**
 *  Middleware that checks authentication state against route
 */
export const isAuthenticated: Middleware = async (request: Request, action: HandlerAction): Promise<void> => {
    if (action.authenticated && !request.isAuthenticated) {
        LOGGER.debug('User not authenticated. Redirecting to login');
        throw new UnauthorizedError('Authentication required');
    }
};
