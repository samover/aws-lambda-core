import { ApiError, ErrorCode } from './apiError';

export class ForbiddenError extends ApiError {
    constructor(message: string, errorCode = ErrorCode.Forbidden) {
        super(message, errorCode);
        this.name = 'ForbiddenError';
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}
