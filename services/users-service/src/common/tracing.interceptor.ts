import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const traceId = randomUUID();
    const request = context.switchToHttp().getRequest();
    const now = Date.now();

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      service: 'users-service',
      trace_id: traceId,
      method: request.method,
      path: request.url,
      message: 'Request started',
    }));

    return next.handle().pipe(
      tap((responseData) => {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          service: 'users-service',
          trace_id: traceId,
          duration_ms: Date.now() - now,
          message: 'Request completed',
          response: responseData,
        }));
      }),
    );
  }
}
