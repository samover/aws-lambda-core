import { ApiError, ErrorCode } from './apiError';

export class ValidationError extends ApiError {
    constructor(message: string | object, errorCode = ErrorCode.ValidationError) {
        let errorMessage = message;
        if (typeof errorMessage !== 'string') {
            errorMessage = JSON.stringify(message);
        }
        super(errorMessage, errorCode);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
