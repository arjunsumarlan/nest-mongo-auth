import * as requestContext from 'request-context';

export class RequestContextService {
  public static get(key: string) {
    return requestContext.get(key);
  }

  public static set(key: string, value: any) {
    return requestContext.set(key, value);
  }
}
