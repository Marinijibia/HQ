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

    this.logger.log('Stripe webhook received, verifying signature...');
    // In production we would do: stripe.webhooks.constructEvent(req.rawBody, signature, secret)
    // Emit internal event for asynchronous billing process
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

    const payload = JSON.stringify(req.body);
    const secret = process.env.GITHUB_WEBHOOK_SECRET || 'github_local_secret';

    // Verify GitHub HMAC signature
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))) {
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
      throw new BadRequestException('Missing Slack headers');
    }

    // Emit internal event for Slack triggers
    this.eventEmitter.emit('integration.slack.event', req.body);
    return res.status(HttpStatus.OK).send({ received: true });
  }
}
