import { ApiError, ErrorCode } from './apiError';

export class NotFoundError extends ApiError {
    constructor(message: string, errorCode = ErrorCode.NotFound) {
        super(message, errorCode);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
