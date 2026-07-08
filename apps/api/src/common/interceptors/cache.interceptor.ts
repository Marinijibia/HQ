import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import Redis from 'ioredis';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpCacheInterceptor.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const { method, url } = request;

    // Cache only GET requests
    if (method !== 'GET') {
      return next.handle();
    }

    const cacheKey = `http_cache:${url}`;

    try {
      const cachedResponse = await this.redis.get(cacheKey);
      if (cachedResponse) {
        this.logger.log(`Cache hit for key: ${cacheKey}`);
        return of(JSON.parse(cachedResponse));
      }
    } catch (err) {
      this.logger.error(`Failed to retrieve cache key: ${cacheKey}`, err);
    }

    this.logger.log(`Cache miss for key: ${cacheKey}`);
    return next.handle().pipe(
      tap(async (response) => {
        if (response) {
          try {
            // Cache for 5 minutes (300 seconds)
            await this.redis.set(cacheKey, JSON.stringify(response), 'EX', 300);
            this.logger.log(`Cached response for key: ${cacheKey}`);
          } catch (err) {
            this.logger.error(`Failed to write cache key: ${cacheKey}`, err);
          }
        }
      }),
    );
  }
}
