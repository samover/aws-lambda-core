/* eslint-disable @typescript-eslint/no-explicit-any */
import cookie from 'cookie';
import get from 'lodash.get';
import toString from 'lodash.tostring';
import * as querystring from 'querystring';
import URLParse from 'url-parse';
import { ContentType } from './common/enums';
import { Json } from './common/interfaces';
import { HttpMethod } from './common/types';

export interface LambdaIdentity {
    accountId: string | null;
    sourceIp: string;
    userAgent: string | null;
    [key: string]: string | null | boolean;
}

export interface LambdaProxyEvent {
    body: string | null;
    headers: { [name: string]: string };
    multiValueHeaders: { [name: string]: string[] };
    httpMethod: HttpMethod;
    path: string;
    pathParameters: { [name: string]: string } | null;
    queryStringParameters: { [name: string]: string } | null;
    requestContext: {
        identity: LambdaIdentity;
        requestId: string;
    };
    resource: string;
    [key: string]: any;
}

export interface LambdaProxyContext {
    callbackWaitsForEmptyEventLoop: boolean;
}

/**
 * Turns a lambda proxy event into a request object.
 *
 * @class Request
 */
export class Request {
    public isAuthenticated: boolean;

    private body: object | string;

    private token: string;

    private headers: Json<string[]>;

    private contentType: ContentType;

    private cookies: Json<string|boolean|number>;

    private ip: string;

    private params: Json<string>;

    private query: Json<string>;

    private path: string;

    private resource: string;

    private xhr: boolean;

    private method: HttpMethod;

    private referer: URLParse;

    private userAgent: string;

    private identity: LambdaIdentity;

    private rawLambdaEvent: LambdaProxyEvent;

    private session: boolean;

    /**
     * @param {LambdaProxyEvent} apiGatewayProxyEvent The event passed to the lambda function
     * with lambda-proxy type integration
     */
    constructor(apiGatewayProxyEvent: LambdaProxyEvent) {
        /** Parsed and normalized headers */
        this.headers = Request.parseHeaders(apiGatewayProxyEvent);
        this.contentType = this.getHeader('content-type') as ContentType;

        /** Parses json or urlencoded string to JSON body or null */
        this.body = this.parseBody(apiGatewayProxyEvent);

        /** * Parsed cookies or empty object */
        this.cookies = Request.parseCookies(this.headers.cookie);

        this.ip = get(apiGatewayProxyEvent, 'requestContext.identity.sourceIp') || '';

        /**
         * This property is an object containing properties mapped to the named route “parameters”. For example,
         * if you have the route /user/:name, then the “name” property is available as req.params.name.
         * This object defaults to {}.
         */
        this.params = get(apiGatewayProxyEvent, 'pathParameters') || {};

        /** * Passed query string parameters. Defaults to {}. */
        this.query = get(apiGatewayProxyEvent, 'queryStringParameters') || {};

        /** * Contains the path part of the request URL. */
        this.path = get(apiGatewayProxyEvent, 'path') || '';

        /** * Contains the resource path. */
        this.resource = get(apiGatewayProxyEvent, 'resource') || '';

        /**
         * A Boolean property that is true if the request’s X-Requested-With header field is “XMLHttpRequest”,
         * indicating that the request was issued by a client library such as jQuery.
         */
        this.xhr = false;

        this.session = false;

        this.method = (toString(get(apiGatewayProxyEvent, 'httpMethod')).toUpperCase() || 'GET') as HttpMethod;

        /** Parsed referring including parsed query */
        this.referer = URLParse(toString(this.headers.referer), true);

        /** User agent passed from API Gateway */
        this.userAgent = get(apiGatewayProxyEvent, 'requestContext.identity.userAgent') || '';

        /** AWS Lambda Identity (source: apiGateway, Cognito, or custom). Can be extended for internal api purpose */
        this.identity = get(apiGatewayProxyEvent, 'requestContext.identity');

        /** Raw API Gateway event */
        this.rawLambdaEvent = apiGatewayProxyEvent;
    }

    /**
     * Returns the field from the requestContext object from AWS API Gateway
     *
     * Returns undefined if nothing is found.
     * The Referrer and Referer fields are interchangeable.
     * @param {string} propertyPath
     * @returns {string|object}
     */
    public getContext(propertyPath: string): string | object {
        return get(this.rawLambdaEvent, `requestContext.${propertyPath}`);
    }

    /**
     * Returns query param value filtered for 'null', 'false', true', etc
     *
     * Returns undefined if nothing is found.
     * @param {string} param
     * @typeparam T Request a queryParam of type T. If not specified a type cast is needed for anything but string.
     */
    public getQueryParam<T extends string | number | boolean>(param: string): T {
        return Request.cast(this.query[param]) as T;
    }

    /**
     * Returns query param value filtered for 'null', 'false', true', etc
     *
     * Returns undefined if nothing is found.
     * @param {string} param
     */
    public getPathParam(param: string): boolean | string | string[] { return Request.valueFilter(this.params[param]); }

    public getQueryParams(): Json<string> { return this.query; }

    public getPathParams(): Json<string> { return this.params; }

    public getBody<T extends string | object>(): T { return this.body as T; }

    public getIdentity(): LambdaIdentity { return this.identity; }

    public addToIdentity(extraIdentityProps: object): void {
        this.identity = { ...this.identity, ...extraIdentityProps };
    }

    public getCookies(): Json<string|boolean|number> { return this.cookies; }

    public getResource(): string { return this.resource; }

    public getPath(): string { return this.path; }

    public getMethod(): HttpMethod { return this.method; }

    public getHeaders(): Json<string[]> { return this.headers; }

    public getIp(): string { return this.ip; }

    public getUserAgent(): string { return this.userAgent; }

    /** Set internal api token on request */
    public setToken(token: string): void { this.token = token; }

    public getToken(): string { return this.token; }

    public setSession(session: boolean): void { this.session = session; }

    public getSession(): boolean { return this.session; }

    /**
     * Returns the cookie value, case-insensitive
     *
     * Returns undefined if nothing is found.
     * @param {string} name
     */
    public getCookie(name: string): string | number | boolean { return this.cookies[name.toLowerCase()]; }

    /**
     * Returns the header value, case-insensitive
     *
     * Returns undefined if nothing is found.
     * @param {string} field
     */
    public getHeader(field: string): string {
        const header: string[] = this.headers[field.toLowerCase()];
        return header && header.join(',');
    }


    /**
     * Parses and normalizes the headers
     * @param lambdaEvent
     */
    private static parseHeaders(lambdaEvent: LambdaProxyEvent): Json<string[]> {
        const lambdaHeaders = { ...get(lambdaEvent, 'multiValueHeaders') };

        const headers: { [key: string]: string[] } = Object.keys(lambdaHeaders)
            .reduce((result: { [key: string]: string[] }, key) => {
                // eslint-disable-next-line no-param-reassign
                result[key.toLowerCase()] = lambdaHeaders[key];
                return result;
            }, {});

        // enforce 'referer' too because the internet can't decide
        if (headers.referrer) {
            headers.referer = headers.referrer;
            delete headers.referrer;
        }

        return headers;
    }

    /**
     * Parses and normalizes the cookies
     * @param cookieHeaders
     */
    private static parseCookies(cookieHeaders: string[] = []): Json<string|boolean|number> {
        const parsedCookies = cookie.parse(cookieHeaders.join(';'));
        return Object.keys(parsedCookies).reduce((result: { [key: string]: string }, key) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            // eslint-disable-next-line no-param-reassign
            result[key.toLowerCase()] = Request.valueFilter(parsedCookies[key]);
            return result;
        }, {});
    }

    /**
     * Parses body
     * @param lambdaEvent
     */
    private parseBody(lambdaEvent: LambdaProxyEvent): object | string {
        const bodyString = get(lambdaEvent, 'body') || null;

        if (!bodyString) { return null; }
        if (typeof bodyString !== 'string') { return bodyString; }

        if (this.contentType && this.contentType.match(ContentType.JSON)) {
            try {
                return JSON.parse(bodyString);
            } catch (e) {
                throw new Error('Request body contains invalid JSON');
            }
        } else if (this.contentType && this.contentType.match(ContentType.URL_ENCODED)) {
            return querystring.decode(bodyString);
        }

        return bodyString;
    }

    /** Casts a query or path parameter string to a JS primitive type if possible.  */
    private static cast(val: string): string | number | boolean {
        if (!val) { return undefined; }
        if (typeof val === 'boolean' || typeof val === 'number') { return val; }
        if (val.toLowerCase() === 'true') { return true; }
        if (val.toLowerCase() === 'false') { return false; }
        if (val.toLowerCase() === 'null') { return null; }
        if (val.toLowerCase() === 'undefined') { return undefined; }
        if (!Number.isNaN(parseFloat(val)) && (`${parseFloat(val)}` === val)) { return parseFloat(val); }
        return val;
    }

    /**
     * Converts 'null' to null, 'false' to false, etc
     * @param (val) val
     */
    private static valueFilter(val: string | boolean | string[]): boolean | string | string[] {
        if (typeof val !== 'string') {
            return val;
        }

        const testVal = val.toLowerCase();

        if (testVal === 'true') {
            return true;
        }

        if (testVal === 'false') {
            return false;
        }

        if (testVal === 'null') {
            return null;
        }

        return val;
    }
}
