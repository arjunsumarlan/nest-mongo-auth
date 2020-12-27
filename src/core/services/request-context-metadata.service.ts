import { REQUEST_CONTEXT } from '../constants/request-context.constant';
import { RequestContextService } from './request-context.service';

export class RequestContextMetadataService {
  public static setMetadata(key: keyof typeof REQUEST_CONTEXT, value: any) {
    RequestContextService.set(`METADATA:${REQUEST_CONTEXT[key]}`, value);
  }

  public static getMetadata<T = any>(key: keyof typeof REQUEST_CONTEXT): T {
    return RequestContextService.get(`METADATA:${REQUEST_CONTEXT[key]}`);
  }

  public static hasMetadata(key: keyof typeof REQUEST_CONTEXT) {
    return Boolean(this.getMetadata(key));
  }
}
