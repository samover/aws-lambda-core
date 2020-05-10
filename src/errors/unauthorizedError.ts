import { ApiError, ErrorCode } from './apiError';

export class UnauthorizedError extends ApiError {
    constructor(message: string, errorCode = ErrorCode.Unauthorized) {
        super(message, errorCode);
        this.name = 'UnauthorizedError';
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}
