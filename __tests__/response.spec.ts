import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    InternalServerError,
    NotFoundError,
    UnauthorizedError,
    ValidationError
} from '../src/errors';
import { ContentType, LambdaProxyEvent, Request, Response } from '../src';
import { apiGatewayProxyEvent } from './__helpers';

let request: Request;
describe('Response', () => {
    beforeEach(() => {
        request = new Request(apiGatewayProxyEvent.get() as unknown as LambdaProxyEvent);
    });

    describe('cookies', () => {
        it('adds a cookie', () => {
            const response = Response.redirect(request,  'http://example.com/callback');
            response.addCookie('accessToken', '1234', { secure: true, httpOnly: true });
            const responseBody = response.send();
            expect(responseBody.multiValueHeaders['set-cookie']).toHaveLength(1);
            expect(responseBody.multiValueHeaders['set-cookie'][0]).toMatch('accessToken=1234');
            expect(responseBody.multiValueHeaders['set-cookie'][0]).toMatch('Secure');
            expect(responseBody.multiValueHeaders['set-cookie'][0]).toMatch('HttpOnly');
        });
        it('allows multiple cookies', () => {
            const response = Response.redirect(request,  'http://example.com/callback');
            response.addCookie('accessToken', '1234', { secure: true, httpOnly: true });
            response.addCookie('refreshToken', '1234', { secure: true, httpOnly: true, path: '/auth/refresh' });
            const responseBody = response.send();
            expect(responseBody.multiValueHeaders['set-cookie']).toHaveLength(2);
        });
        it('has default cookieOptions', () => {
            const response = Response.redirect(request,  'http://example.com/callback');
            response.addCookie('accessToken', '1234' );
            const responseBody = response.send();
            expect(responseBody.multiValueHeaders['set-cookie'][0]).toMatch(/Domain=.*; Path=\/; HttpOnly; Secure; SameSite=None/);
        });
    });
    describe('CORS', () => {
        describe('With cors disabled allow requests without origin', () => {
            it('cors disabled (default): allows absence of origin header', () => {
                // @ts-ignore
                delete request.headers.origin;
                const response = Response.noContent(request, { cors: false }).send();
                expect(response.statusCode).toEqual(204);
            });
            it('cors enabled : does not allow absence of origin header', () => {
                // @ts-ignore
                delete request.headers.origin;
                expect(() => Response.noContent(request, { cors: true }).send()).toThrow(InternalServerError);
            });

        });
        describe('Allowed headers are not specified', () => {
            it('returns cors header "access-control-allow-origin" with request origin', () => {
                // @ts-ignore
                request.headers.origin = ['http://localhost:8000'];
                const response = Response.ok(request, { cors: true }).send({ success: 'ok' });
                expect(response.multiValueHeaders['access-control-allow-origin']).toContain('http://localhost:8000');
            });
        });
        describe('Allowed headers are specified', () => {
            it('returns cors header "access-control-allow-origin" with request origin', () => {
                process.env.ALLOWED_ORIGINS = 'http://localhost:8000';
                const { Response: ResponseWithCors } = require('../src');
                // @ts-ignore
                request.headers.origin = ['http://localhost:8000'];
                const response = ResponseWithCors.ok(request, { cors: true }).send({ success: 'ok' });
                expect(response.multiValueHeaders['access-control-allow-origin']).toContain('http://localhost:8000');
            });
            it('returns cors header "access-control-allow-origin" with null value if no cors access', () => {
                process.env.ALLOWED_ORIGINS = 'http://localhost:8000';
                const { Response: ResponseWithCors } = require('../src');
                // @ts-ignore
                request.headers.origin = ['http://foreign/domain'];
                const response = ResponseWithCors.ok(request, { cors: true }).send({ success: 'ok' });
                expect(response.multiValueHeaders['access-control-allow-origin']).toEqual([]);
            });
            it('returns cors header "access-control-allow-origin" with origin domain when mulitpel cors headers are allowed', () => {
                process.env.ALLOWED_ORIGINS = 'http://localhost:8000,http://allowed/domain';
                const { Response: ResponseWithCors } = require('../src');
                // @ts-ignore
                request.headers.origin = ['http://allowed/domain'];
                const response = ResponseWithCors.ok(request, { cors: true }).send({ success: 'ok' });
                expect(response.multiValueHeaders['access-control-allow-origin']).toContain('http://allowed/domain');
            });
        });
    });

    describe('2XX', () => {
        it('#ok: sends 200 response with json', () => {
            const response = Response.ok(request).send({ success: 'ok' });
            expect(response.statusCode).toEqual(200);
            expect(response.multiValueHeaders['content-type']).toContain(ContentType.JSON);
            expect(JSON.parse(response.body as string)).toEqual({ success: 'ok' });
        });
        it('#render: sends an 200 response with html', () => {
            const responseBody = '<h1>header</h1>';
            const response = Response.render(request).send(responseBody);
            expect(response.statusCode).toEqual(200);
            expect(response.multiValueHeaders['content-type']).toContain(ContentType.HTML);
            expect(response.body).toEqual(responseBody);
        });
        it('#created: sends 201 response with json', () => {
            const response = Response.created(request).send({ success: 'ok' });
            expect(response.statusCode).toEqual(201);
            expect(response.multiValueHeaders['content-type']).toContain(ContentType.JSON);
            expect(JSON.parse(response.body as string)).toEqual({ success: 'ok' });
        });
        it('#noContent: sends 204 response with empty body', () => {
            const response = Response.noContent(request).send();
            expect(response.statusCode).toEqual(204);
            expect(response.body).toEqual('');
        });
    });
    describe('3XX', () => {
        it('#redirect: sends 302 with location header', () => {
            const response = Response.redirect(request, 'redirectUrl').send();
            expect(response.statusCode).toEqual(302);
            expect(response.multiValueHeaders.location).toContain('redirectUrl');
        });
    });

    describe('4XX', () => {
        it('#badRequest: sends a 400 with error body', () => {
            const expectedStatusCode = 400;
            const apiError = new BadRequestError('Oops');
            const response = Response.fromError(request, apiError);
            const errorBody = JSON.parse(response.body as string);

            expect(response.statusCode).toEqual(expectedStatusCode);
            expect(errorBody.message).toEqual(apiError.message);
            expect(errorBody.errorCode).toEqual(apiError.errorCode);
            expect(errorBody.stack).not.toBeUndefined();
            expect(errorBody.stack).toEqual(apiError.stack);
        });
        it('#validationError: sends a 400 with error body', () => {
            const expectedStatusCode = 400;
            const apiError = new ValidationError({
                validationErrors: [
                    {
                        field: 'name',
                        validationError: 'name is required',
                    }
                ]});
            const response = Response.fromError(request, apiError);
            const errorBody = JSON.parse(response.body as string);

            expect(response.statusCode).toEqual(expectedStatusCode);
            expect(errorBody.message).toEqual('Validation error');
            expect(errorBody.validationErrors).toEqual(JSON.parse(apiError.message).validationErrors);
            expect(errorBody.errorCode).toEqual(apiError.errorCode);
            expect(errorBody.stack).not.toBeUndefined();
            expect(errorBody.stack).toEqual(apiError.stack);
        });
        it('#unauthorized: sends a 401 with error body', () => {
            const expectedStatusCode = 401;
            const apiError = new UnauthorizedError('Oops');
            const response = Response.fromError(request, apiError);
            const errorBody = JSON.parse(response.body as string);

            expect(response.statusCode).toEqual(expectedStatusCode);
            expect(errorBody.message).toEqual(apiError.message);
            expect(errorBody.errorCode).toEqual(apiError.errorCode);
            expect(errorBody.stack).not.toBeUndefined();
            expect(errorBody.stack).toEqual(apiError.stack);
        });
        it('#forbidden: sends a 403 with error body', () => {
            const expectedStatusCode = 403;
            const apiError = new ForbiddenError('Oops');
            const response = Response.fromError(request, apiError);
            const errorBody = JSON.parse(response.body as string);

            expect(response.statusCode).toEqual(expectedStatusCode);
            expect(errorBody.message).toEqual(apiError.message);
            expect(errorBody.errorCode).toEqual(apiError.errorCode);
            expect(errorBody.stack).not.toBeUndefined();
            expect(errorBody.stack).toEqual(apiError.stack);
        });
        it('#notFound: sends a 404 with error body', () => {
            const expectedStatusCode = 404;
            const apiError = new NotFoundError('Oops');
            const response = Response.fromError(request, apiError);
            const errorBody = JSON.parse(response.body as string);

            expect(response.statusCode).toEqual(expectedStatusCode);
            expect(errorBody.message).toEqual(apiError.message);
            expect(errorBody.errorCode).toEqual(apiError.errorCode);
            expect(errorBody.stack).not.toBeUndefined();
            expect(errorBody.stack).toEqual(apiError.stack);
        });
        it('#conflict: sends a 409 with error body', () => {
            const expectedStatusCode = 409;
            const apiError = new ConflictError('Oops');
            const response = Response.fromError(request, apiError);
            const errorBody = JSON.parse(response.body as string);

            expect(response.statusCode).toEqual(expectedStatusCode);
            expect(errorBody.message).toEqual(apiError.message);
            expect(errorBody.errorCode).toEqual(apiError.errorCode);
            expect(errorBody.stack).not.toBeUndefined();
            expect(errorBody.stack).toEqual(apiError.stack);
        });
        it('#conflict: sends a 409 with error body', () => {
            const expectedStatusCode = 409;
            const apiError = new ConflictError('Oops');
            const response = Response.fromError(request, apiError);
            const errorBody = JSON.parse(response.body as string);

            expect(response.statusCode).toEqual(expectedStatusCode);
            expect(errorBody.message).toEqual(apiError.message);
            expect(errorBody.errorCode).toEqual(apiError.errorCode);
            expect(errorBody.stack).not.toBeUndefined();
            expect(errorBody.stack).toEqual(apiError.stack);
        });
    });
    describe('5XX', () => {
        it('#internalServer: sends a 500 with error body', () => {
            const expectedStatusCode = 500;
            const apiError = new InternalServerError('Oops');
            const response = Response.fromError(request, apiError);
            const errorBody = JSON.parse(response.body as string);

            expect(response.statusCode).toEqual(expectedStatusCode);
            expect(errorBody.message).toEqual(apiError.message);
            expect(errorBody.errorCode).toEqual(apiError.errorCode);
            expect(errorBody.stack).not.toBeUndefined();
            expect(errorBody.stack).toEqual(apiError.stack);
        });
        it('#internalServer: sends a 500 with error body when error is not an apiError', () => {
            const expectedStatusCode = 500;
            const apiError = new Error('Oops');
            // @ts-ignore
            const response = Response.fromError(request, apiError);
            const errorBody = JSON.parse(response.body as string);

            expect(response.statusCode).toEqual(expectedStatusCode);
            expect(errorBody.message).toEqual(apiError.message);
            expect(errorBody.errorCode).toBeUndefined();
            expect(errorBody.stack).not.toBeUndefined();
            expect(errorBody.stack).toEqual(apiError.stack);
        });
    });
});
