import { UnauthorizedError } from '../../src/errors';
import * as faker from 'faker';
import { HandlerAction, isAuthenticated, LambdaProxyEvent, Request } from '../../src';
import { apiGatewayProxyEvent } from '../__helpers';

const action: HandlerAction = {
    authenticated: true,
    name: faker.random.word(),
    path: faker.random.word(),
    method: 'GET',
    useSession: false,
    roles: [],
};

describe('Middleware/IsAuthenticated', () => {
    const request = new Request(apiGatewayProxyEvent.get() as unknown as LambdaProxyEvent);

    it('resolves when request against authenticated route is authenticated', async () => {
        request.isAuthenticated = true;
        action.authenticated = true;

        await expect(isAuthenticated(request, action)).resolves.toBeUndefined();
    });
    it('resolves when request against unauthenticated route is not authenticated', async () => {
        request.isAuthenticated = false;
        action.authenticated = false;

        await expect(isAuthenticated(request, action)).resolves.toBeUndefined();
    });
    it('throws an UnauthorizedError when request against authenticated route is not authenticated', async () => {
        request.isAuthenticated = false;
        action.authenticated = true;

        await expect(isAuthenticated(request, action)).rejects.toBeInstanceOf(UnauthorizedError);
    });
});
