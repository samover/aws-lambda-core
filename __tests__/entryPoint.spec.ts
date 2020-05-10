import { BadRequestError } from '../src/errors';
import {Handler, LambdaEntryPoint, LambdaProxyContext, LambdaProxyEvent, Middleware, Request} from '../src';
import { apiGatewayProxyEvent } from './__helpers';

class HandlerImplementation extends Handler {
    protected middleware: Middleware[];
}

// tslint:disable-next-line:max-classes-per-file
class EntryPointImplementation extends LambdaEntryPoint {
    protected async initializeHandler(): Promise<Handler> {
        return new HandlerImplementation();
    }

}

const handleMock = jest.fn();
let event: LambdaProxyEvent;
let implementation: EntryPointImplementation;
let context: LambdaProxyContext;

jest.mock('../src/Request');

describe('EntryPoint', () => {
    beforeEach(() => {
        // @ts-ignore
        context = {};
        event = apiGatewayProxyEvent.get() as unknown as LambdaProxyEvent;
        event.httpMethod = 'GET';
        event.resource = '/profile/{id}';
        implementation = new EntryPointImplementation();
        HandlerImplementation.prototype.handle = handleMock;
    });

    afterEach(() => jest.resetAllMocks());

    it('sets context.callbackWaitsForEmptyEventLoop to false when context is provided', async () => {
        await implementation.handle(event, context);
        expect(context.callbackWaitsForEmptyEventLoop).toEqual(false);
    });

    it('invokes the handle function of the controller with a request object and return handle function result as is', async () => {
        handleMock.mockResolvedValue('OK');
        const response = await implementation.handle(event, context);
        expect(HandlerImplementation.prototype.handle).toHaveBeenCalledTimes(1);
        expect(HandlerImplementation.prototype.handle).toHaveBeenCalledWith(expect.any(Request));
        expect(response).toEqual('OK');
    });

    it('invokes the heartbeat function when no event is passed and returns 204', async () => {
        // @ts-ignore
        const response = await implementation.handle({});
        expect(context.callbackWaitsForEmptyEventLoop).toBeFalsy();
        expect(HandlerImplementation.prototype.handle).not.toHaveBeenCalled();
        expect(response.statusCode).toEqual(204);
    });

    it('returns errorResponse when handler throws', async () => {
        // @ts-ignore
        Request.prototype.getHeader.mockReturnValue('https://example.com');
        handleMock.mockRejectedValue(new BadRequestError('Oops'));
        const response = await implementation.handle(event);
        expect(HandlerImplementation.prototype.handle).toHaveBeenCalledTimes(1);
        expect(HandlerImplementation.prototype.handle).toHaveBeenCalledWith(expect.any(Request));
        expect(response.statusCode).toEqual(400);
    });

    it('returns errorResponse when initializing handler fails', async () => {
        // @ts-ignore
        EntryPointImplementation.prototype.initializeHandler = () => { throw new Error('OOPS'); };
        // @ts-ignore
        Request.prototype.getHeader.mockReturnValue('https://example.com');
        const response = await implementation.handle(event);
        expect(HandlerImplementation.prototype.handle).not.toHaveBeenCalled();
        expect(response.statusCode).toEqual(500);
    });
});
