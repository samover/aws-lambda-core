import { RequestMethod } from '../enums/requestMethod.enum';

export interface RequestMappingConfig {
    path?: string | string[];
    method?: RequestMethod;
}
