import { Injectable, NestMiddleware } from '@nestjs/common';
import * as requestContext from 'request-context';

export class RequestContextMiddleware implements NestMiddleware {
  use = requestContext.middleware('request').bind(requestContext);

  public static get rawExpressMiddleware() {
    return new RequestContextMiddleware().use;
  }
}
