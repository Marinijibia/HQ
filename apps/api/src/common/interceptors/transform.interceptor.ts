import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the return object is already formatted with metadata
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'meta' in data
        ) {
          const resObj = data as Record<string, unknown>;
          return {
            success: true,
            data: resObj.data,
            meta: resObj.meta,
            timestamp: new Date().toISOString(),
          } as unknown as Response<T>;
        }

        return {
          success: true,
          data: data === undefined ? null : data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
