/**
 * ErrorCode is a string representation of the type of error
 */
export enum ErrorCode {
    // DEFAULT ERROR CODES
    BadRequest = 'BadRequest',
    Conflict = 'Conflict',
    Forbidden = 'Forbidden',
    InternalServerError = 'InternalServerError',
    NotFound = 'NotFound',
    Unauthorized = 'Unauthorized',
    ValidationError = 'ValidationError',

    // CUSTOM ERROR CODES
    DuplicateEmail = 'DuplicateEmailError',
    InvalidEmail = 'InvalidEmailError',
    InvalidPassword = 'InvalidPasswordError',
}

/**
 * ApiError Class
 *
 * @remarks Used by the ApiGateway Lambdas
 */
export class ApiError extends Error {
    public errorCode: ErrorCode;

    constructor(message: string, errorCode: ErrorCode) {
        super(message);
        this.errorCode = errorCode;
        this.name = 'ApiError';
    }

    // /**
    //  * A strict implementation of isInstanceOfkj
    //  */
    // public isInstanceOf(prototype: typeof ApiError) {
    //     return this.name === prototype.name
    //         || this.name === prototype.constructor.name;
    // }
}
