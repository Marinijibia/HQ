import { Controller, Get, Inject, HttpStatus, Res } from '@nestjs/common';
import * as express from 'express';
import { PrismaService } from '../database/prisma.service';
import Redis from 'ioredis';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  @Get()
  async getHealth(@Res() res: express.Response) {
    const healthcheck = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        database: 'UP',
        redis: 'UP',
        storage: 'UP',
      },
    };

    try {
      // 1. Check PostgreSQL database connection
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      healthcheck.status = 'DOWN';
      healthcheck.services.database = 'DOWN';
    }

    try {
      // 2. Check Redis connection
      const ping = await this.redis.ping();
      if (ping !== 'PONG') {
        healthcheck.status = 'DOWN';
        healthcheck.services.redis = 'DOWN';
      }
    } catch (error) {
      healthcheck.status = 'DOWN';
      healthcheck.services.redis = 'DOWN';
    }

    const statusCode =
      healthcheck.status === 'UP'
        ? HttpStatus.OK
        : HttpStatus.SERVICE_UNAVAILABLE;
    return res.status(statusCode).json(healthcheck);
  }
}
