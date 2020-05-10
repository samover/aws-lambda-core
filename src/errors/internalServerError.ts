import { ApiError, ErrorCode } from './apiError';

export class InternalServerError extends ApiError {
    constructor(message: string, errorCode = ErrorCode.InternalServerError) {
        super(message, errorCode);
        this.name = 'InternalServerError';
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}
