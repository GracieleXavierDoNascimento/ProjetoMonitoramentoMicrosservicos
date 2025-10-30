import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const traceId = randomUUID();
    res.setHeader('x-trace-id', traceId);

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      service: 'users-service',
      method: req.method,
      path: req.url,
      trace_id: traceId,
      message: 'Request received',
    }));

    next();
  }
}
