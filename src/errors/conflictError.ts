import { ApiError, ErrorCode } from './apiError';

export class ConflictError extends ApiError {
    constructor(message: string, errorCode = ErrorCode.Conflict) {
        super(message, errorCode);
        this.name = 'ConflictError';
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
