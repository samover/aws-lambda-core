import { ApiError, ErrorCode } from './apiError';

export class BadRequestError extends ApiError {
    constructor(message: string, errorCode = ErrorCode.BadRequest) {
        super(message, errorCode);
        this.name = 'BadRequestError';
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}
