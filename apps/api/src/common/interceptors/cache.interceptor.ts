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

    // Clear cache on write mutations
    if (method !== 'GET') {
      return next.handle().pipe(
        tap(async () => {
          try {
            const prefix = url.split('?')[0].split('/').slice(0, 3).join('/');
            const keys = await this.redis.keys(`http_cache:*${prefix}*`);
            if (keys.length > 0) {
              await this.redis.del(...keys);
              this.logger.log(
                `Invalidated cache keys matching prefix: ${prefix} (${keys.length} keys)`,
              );
            }
          } catch (err) {
            this.logger.error(
              `Failed to invalidate cache keys for: ${url}`,
              err,
            );
          }
        }),
      );
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
