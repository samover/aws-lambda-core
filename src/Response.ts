/* tslint:disable:object-literal-sort-keys */
import cookie from 'cookie';
import {
    ApiError,
    BadRequestError,
    ConflictError,
    ForbiddenError,
    InternalServerError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from './errors';
import { Strings } from './utils';
import { ContentType } from './common/enums/contentType.enum';
import { Request } from './Request';
import { ResponseBody, ResponseBodyInput } from './ResponseBody';

export interface ResponseOptions {
    cors: boolean;
}

export interface CookieOptions {
    httpOnly?: boolean;
    secure?: boolean;
    domain?: string;
    path?: string;
    sameSite?: 'lax' | 'strict' | 'none';
    expires?: Date;
}

interface JsonObject {
    [key: string]: any;
}

/**
 * Wrapper for ApiGateway Response
 *
 * ```
 * // { statusCode: 200, body: { success: true }};
 * return Response.ok(request, { success: true });
 *
 * // { statusCode: 403, body: { error: ... }};
 * const forbiddenError = new ForbiddenError();
 * return Response.fromError(request, forbiddenError);
 *
 * // { statusCode: 302, body: '' } with redirect header;
 * const forbiddenError = new ForbiddenError();
 * return Response.redirect(request, 'https://redirect/to');
 * ```
 */
export class Response<T> {
    private allowedOrigins: string[] = Strings.toList(process.env.ALLOWED_ORIGINS || '*');

    private body: T; // ResponseBodyInput['body'] = '';

    private status: ResponseBodyInput['statusCode'];

    private headers: ResponseBodyInput['headers'];

    private contentType: string;

    private cors = true; // use cors by default

    constructor(statusCode: number, request: Request, options?: ResponseOptions) {
        this.status = statusCode;
        this.cors = options && [false, true].includes(options.cors) ? options.cors : this.cors;
        if (this.cors) {
            this.setCorsHeaders(request);
        }
    }

    public static render(request: Request, options?: ResponseOptions): Response<string> {
        const response = Response.response<string>(200, request, options);
        response.setHeader('Content-Type', ContentType.HTML);
        return response;
    }

    public static redirect(request: Request, redirectUrl: string, options?: ResponseOptions): Response<null> {
        const response = Response.response<null>(302, request, options);
        response.setHeader('location', redirectUrl);
        response.setHeader('content-type', ContentType.HTML);
        return response;
    }

    public static ok<T>(request: Request, options?: ResponseOptions): Response<T> {
        return Response.response<T>(200, request, options);
    }

    public static created(request: Request, options?: ResponseOptions): Response<JsonObject> {
        return Response.response<JsonObject>(201, request, options);
    }

    public static noContent(request: Request, options?: ResponseOptions): Response<null> {
        return Response.response<null>(204, request, options);
    }

    public static badRequest(request: Request, options?: ResponseOptions): Response<JsonObject> {
        return Response.response<JsonObject>(400, request, options);
    }

    public static conflict(request: Request, options?: ResponseOptions) {
        return Response.response<JsonObject>(409, request, options);
    }

    public static notFound(request: Request, options?: ResponseOptions) {
        return Response.response<JsonObject>(404, request, options);
    }

    public static internalServerError(request: Request, options?: ResponseOptions) {
        return Response.response<JsonObject>(500, request, options);
    }

    public static unauthorized(request: Request, options?: ResponseOptions) {
        return Response.response<JsonObject>(401, request, options);
    }

    public static forbidden(request: Request, options?: ResponseOptions) {
        return Response.response<JsonObject>(403, request, options);
    }

    private static convertError(e: ApiError) {
        return {
            message: e.message,
            errorCode: e.errorCode,
            stack: e.stack,
        };
    }

    public static fromError(request: Request, error: ApiError, options?: ResponseOptions): ResponseBody {
        switch (error.constructor) {
            case InternalServerError:
                return Response.internalServerError(request, options).send(this.convertError(error));
            case ConflictError:
                return Response.conflict(request, options).send(this.convertError(error));
            case NotFoundError:
                return Response.notFound(request, options).send(this.convertError(error));
            case UnauthorizedError:
                return Response.unauthorized(request, options).send(this.convertError(error));
            case BadRequestError:
                return Response.badRequest(request, options).send(this.convertError(error));
            case ForbiddenError:
                return Response.forbidden(request, options).send(this.convertError(error));
            case ValidationError:
                return Response.badRequest(request, options).send({
                    message: 'Validation error',
                    errorCode: 'ValidationError',
                    ...JSON.parse(error.message),
                    stack: error.stack,
                });
            default:
                return Response.internalServerError(request, options).send(this.convertError(error));
        }
    }

    private static corsResponse(request: Request, allowedOrigins: string[]): string {
        const origin = request.getHeader('Origin');
        if (!origin) { throw new InternalServerError('Origin request header not set'); }
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            return origin;
        }
        return null;
    }

    private static response<T>(statusCode: number, request: Request, options?: ResponseOptions) {
        return new Response<T>(statusCode, request, options);
    }

    /**
     * Sets contentType based on body and stringifies the body before returning [[ResponseBody]]
     */
    public send(body: T | string = null): ResponseBody {
        body = body == null ? this.body : body;

        if (!this.getHeader('content-type')) {
            this.setHeader('content-type', 'text');
            this.contentType = 'text';
        }

        if (typeof body === 'object') {
            this.setHeader('content-type', 'application/json');
            return this.send(JSON.stringify(body));
        }

        if (typeof body !== 'string') {
            body = JSON.stringify(body) as unknown as string;
        }

        const responseBody = new ResponseBody({
            body: body as unknown as string,
            headers: this.headers,
            statusCode: this.status,
        });
        return responseBody;
    }

    public addCookie(key: string, val: string, options: CookieOptions = {}) {
        const cookieHeader = this.headers['set-cookie'] || [];
        const cookieOptions: CookieOptions = {
            httpOnly: true,
            secure: true,
            domain: new URL(process.env.API_BASE_URL).host,
            path: '/',
            sameSite: 'none',
            ...options,
        };
        cookieHeader.push(cookie.serialize(key, val, cookieOptions));
        this.headers['set-cookie'] = cookieHeader;
    }

    /**
     * Set header `field` to `val`, or pass
     * an object of header fields.
     *
     * Examples:
     *
     *    res.set('Foo', ['bar', 'baz']);
     *    res.set('Accept', 'application/json');
     *    res.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
     *
     * Aliased as `res.header()`.
     *
     * @param {String|Object} field
     * @param {String|Array} [val]
     * @return {Response} for chaining
     * @public
     */
    public setHeader(field: string, val: string | string[]): void {
        const value: string[] = val ? (Array.isArray(val) ? val.map((v) => `${v}`) : [`${val}`]) : [];

        if (typeof this.headers === 'undefined') {
            this.headers = {};
        }

        this.headers[field.toLowerCase()] = value;
    }

    /**
     * Get value for header `field`.
     *
     * @param {String} field
     * @return {String}
     * @public
     */
    private getHeader(field: string): string | undefined {
        return (
            typeof this.headers !== 'undefined'
                ? this.headers[field.toLowerCase()] && this.headers[field.toLowerCase()][0]
                : undefined);
    }

    private setCorsHeaders(request: Request) {
        this.setHeader('Access-Control-Allow-Origin', Response.corsResponse(request, this.allowedOrigins));
        this.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    private setHeaders(headers: ResponseBodyInput['headers']) {
        for (const header in headers) {
            if (headers.hasOwnProperty(header)) {
                this.setHeader(header, headers[header]);
            }
        }
    }
}
