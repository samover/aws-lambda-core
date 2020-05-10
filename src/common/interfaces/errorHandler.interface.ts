import { Request } from '../../Request';
import { ResponseBody } from '../../ResponseBody';

export interface ErrorHandler {
    (error: Error, request: Request, functionName?: string|symbol, klass?: any): Promise<ResponseBody>;
}
