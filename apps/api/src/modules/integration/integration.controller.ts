import {
  Controller,
  Post,
  Headers,
  Req,
  Res,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as express from 'express';
import * as crypto from 'crypto';

@Controller('webhooks')
export class IntegrationController {
  private readonly logger = new Logger(IntegrationController.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (secret) {
      const sigParts = signature.split(',').reduce((acc: any, part: string) => {
        const [k, v] = part.split('=');
        if (k && v) acc[k.trim()] = v.trim();
        return acc;
      }, {});

      const timestamp = sigParts['t'];
      const receivedSig = sigParts['v1'];

      if (!timestamp || !receivedSig) {
        throw new BadRequestException('Malformed stripe-signature header structure');
      }

      // Replay attack prevention: Enforce 300-second freshness window
      const now = Math.floor(Date.now() / 1000);
      const parsedTimestamp = parseInt(timestamp, 10);
      if (isNaN(parsedTimestamp) || Math.abs(now - parsedTimestamp) > 300) {
        this.logger.warn(`Stripe webhook rejected: timestamp ${timestamp} expired or outside 300s tolerance`);
        throw new BadRequestException('Stripe webhook timestamp expired (replay protection)');
      }

      const rawBody = (req as any).rawBody
        ? (req as any).rawBody.toString('utf8')
        : JSON.stringify(req.body);
      const signedPayload = `${timestamp}.${rawBody}`;
      const digest = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

      try {
        const digestBuf = Buffer.from(digest);
        const receivedBuf = Buffer.from(receivedSig);
        if (
          digestBuf.length !== receivedBuf.length ||
          !crypto.timingSafeEqual(digestBuf, receivedBuf)
        ) {
          throw new BadRequestException('Invalid Stripe webhook signature');
        }
      } catch {
        throw new BadRequestException('Stripe webhook signature mismatch');
      }
    } else if (process.env.NODE_ENV === 'production') {
      this.logger.error('[Security Warning] STRIPE_WEBHOOK_SECRET is not configured in production.');
      throw new BadRequestException('Webhook signature verification unconfigured');
    }

    this.logger.log('Stripe webhook verified. Emitting integration event...');
    this.eventEmitter.emit('integration.stripe.event', req.body);

    return res.status(HttpStatus.OK).send({ received: true });
  }

  @Post('github')
  async handleGithubWebhook(
    @Headers('x-hub-signature-256') signature: string,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing x-hub-signature-256 header');
    }

    if (!signature.startsWith('sha256=')) {
      throw new BadRequestException('Malformed x-hub-signature-256 header format');
    }

    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      this.logger.error('[Security Warning] GITHUB_WEBHOOK_SECRET is not configured in production.');
      throw new BadRequestException('Webhook signature verification unconfigured');
    }

    const rawBody = (req as any).rawBody
      ? (req as any).rawBody.toString('utf8')
      : JSON.stringify(req.body);
    const activeSecret = secret || 'github_local_secret';

    // Verify GitHub HMAC signature
    const hmac = crypto.createHmac('sha256', activeSecret);
    const digest = 'sha256=' + hmac.update(rawBody).digest('hex');

    const digestBuf = Buffer.from(digest, 'utf8');
    const signatureBuf = Buffer.from(signature, 'utf8');

    if (
      digestBuf.length === signatureBuf.length &&
      crypto.timingSafeEqual(digestBuf, signatureBuf)
    ) {
      this.logger.log('GitHub webhook signature verified. Emitting event...');
      this.eventEmitter.emit('integration.github.event', req.body);
      return res.status(HttpStatus.OK).send({ verified: true });
    }

    this.logger.warn('GitHub webhook signature validation failed.');
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .send({ error: 'Signature mismatch' });
  }

  @Post('slack')
  async handleSlackWebhook(
    @Headers('x-slack-signature') signature: string,
    @Headers('x-slack-request-timestamp') timestamp: string,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    if (!signature || !timestamp) {
      throw new BadRequestException('Missing Slack signature or timestamp headers');
    }

    // Check for replay attacks: timestamp must be within 5 minutes
    const nowSeconds = Math.floor(Date.now() / 1000);
    const requestSeconds = parseInt(timestamp, 10);
    if (isNaN(requestSeconds) || Math.abs(nowSeconds - requestSeconds) > 300) {
      throw new BadRequestException('Slack request timestamp expired or invalid');
    }

    const secret = process.env.SLACK_SIGNING_SECRET;
    if (secret) {
      const rawBody = (req as any).rawBody
        ? (req as any).rawBody.toString('utf8')
        : JSON.stringify(req.body);
      const sigBasestring = `v0:${timestamp}:${rawBody}`;
      const hmac = crypto.createHmac('sha256', secret);
      const digest = 'v0=' + hmac.update(sigBasestring).digest('hex');

      try {
        if (!crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))) {
          throw new BadRequestException('Slack signature verification failed');
        }
      } catch {
        throw new BadRequestException('Slack signature mismatch');
      }
    } else if (process.env.NODE_ENV === 'production') {
      this.logger.error('[Security Warning] SLACK_SIGNING_SECRET is not configured in production.');
      throw new BadRequestException('Slack webhook signature verification unconfigured');
    }

    // Emit internal event for Slack triggers
    this.eventEmitter.emit('integration.slack.event', req.body);
    return res.status(HttpStatus.OK).send({ received: true });
  }
}
