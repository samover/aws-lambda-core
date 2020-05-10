import 'reflect-metadata';
import { BadRequestError } from '../src/errors';
import {
    Authenticated,
    Get,
    Handler,
    LambdaProxyEvent,
    Middleware, Post,
    Request, Response,
    ResponseBody
} from '../src';
import { UseErrorHandler } from '../src/common/decorators/requestUseErrorHandler.decorator';
import { apiGatewayProxyEvent } from './__helpers';

const getProfileStub = jest.fn();

const errorHandlerMessage = 'error from errorHandler';
const errorHandler = async (e: Error, request: Request) => {
    return Response.fromError(request, new BadRequestError(errorHandlerMessage));
};

class HandlerImplementation extends Handler {
    public middleware: Middleware[];

    @Get('/profile/{id}')
    @UseErrorHandler(errorHandler)
    @Authenticated()
    public async getProfile(req: Request) {
        return getProfileStub(req);
    }
}

class ErrorHandlerImplementation extends Handler {
    public middleware: Middleware[];

    @Get('/user/{id}')
    @UseErrorHandler(errorHandler)
    public async getUser(req: Request) {
        throw new Error('oops');
    }
}

let handlerImplementation: HandlerImplementation;
let event: LambdaProxyEvent;
let request: Request;

describe('Handler', () => {
    beforeEach(() => {
        handlerImplementation = new HandlerImplementation();
        event = apiGatewayProxyEvent.get() as unknown as LambdaProxyEvent;
        event.httpMethod = 'GET';
        event.resource = '/profile/{id}';
        request = new Request(event);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('is an abstract class that needs extending', () => {
        expect(handlerImplementation).toBeInstanceOf(Handler);
    });

    describe('#handle', () => {
        it('uses errorHandler decorator', async () => {
            const errorHandlerImplementation = new ErrorHandlerImplementation();
            event = apiGatewayProxyEvent.get() as unknown as LambdaProxyEvent;
            event.httpMethod = 'GET';
            event.resource = '/user/{id}';
            request = new Request(event);
            const response = await errorHandlerImplementation.handle(request);
            expect(response.statusCode).toEqual(400);
            expect(response.body).toMatch(errorHandlerMessage);
        });
        it('returns 500 response when Routepath is unknown', async () => {
            event.httpMethod = 'PATCH';
            request = new Request(event);
            const response = await handlerImplementation.handle(request);
            expect(response.statusCode).toEqual(500);
        });
        it('invokes correct path', async () => {
            const response = await handlerImplementation.handle(request);
            expect(getProfileStub).toHaveBeenCalledTimes(1);
            expect(getProfileStub).toHaveBeenCalledWith(request);
        });
        it('applies middleware and continues to correct path if middleware does not contain response', async () => {
            const middlewareMock = jest.fn().mockResolvedValue('OK');
            handlerImplementation.middleware.push(middlewareMock);
            const response = await handlerImplementation.handle(request);
            expect(middlewareMock).toHaveBeenCalledTimes(1);
            // @ts-ignore
            expect(middlewareMock).toHaveBeenCalledWith(request, handlerImplementation.getRouteConfig(request));
            expect(getProfileStub).toHaveBeenCalledTimes(1);
            expect(getProfileStub).toHaveBeenCalledWith(request);
        });
        it('applies middleware and returns middleware ApiResponse', async () => {
            const middlewareMock = jest.fn().mockResolvedValue(new ResponseBody({ statusCode: 406 }));
            handlerImplementation.middleware.push(middlewareMock);
            const response = await handlerImplementation.handle(request);
            expect(middlewareMock).toHaveBeenCalledTimes(1);
            // @ts-ignore
            expect(middlewareMock).toHaveBeenCalledWith(request, handlerImplementation.getRouteConfig(request));
            expect(getProfileStub).not.toHaveBeenCalled();
            expect(response.statusCode).toEqual(406);
        });
    });

    describe('#getRouteConfig', () => {
        it('parses a routeConfig from a request', () => {
            const path = 'GET_PROFILE';
            // @ts-ignore
            const route = handlerImplementation.getRouteConfig(request);

            expect(route.authenticated).toEqual(true);
            expect(route.method).toEqual('GET');
            expect(route.name).toEqual('getProfile');
            expect(route.path).toEqual('/profile/{id}');
        });
        it('returns Undefined Route error when METHOD + PATH is not in routeConfig', () => {
            event.httpMethod = 'PATCH';
            request = new Request(event);
            // @ts-ignore
            expect(() => handlerImplementation.getRouteConfig(request)).toThrow('Route undefined');
        });
        it('returns Undefined Route error when METHOD is missing', () => {
            // @ts-ignore
            delete request.method;
            // @ts-ignore
            expect(() => handlerImplementation.getRouteConfig(request)).toThrow('Route undefined');
        });
        it('returns Undefined Route error when PATH is missing', () => {
            event.httpMethod = 'PATCH';
            request = new Request(event);
            // @ts-ignore
            expect(() => handlerImplementation.getRouteConfig(request)).toThrow('Route undefined');
        })
    });
});
