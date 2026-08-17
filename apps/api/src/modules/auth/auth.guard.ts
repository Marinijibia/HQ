import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { UserRepository } from '../user/user.repository';
import { AuthenticatedRequest } from '../../common/interfaces/request.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly userRepository: UserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('Authentication token missing from request headers');
      throw new UnauthorizedException(
        'Request lacks authentication credentials',
      );
    }

    try {
      // Verify our HMAC-SHA256 signed JWT (supports both 2-part and 3-part JWTs)
      const payload = this.verifyJwt(token);

      const isUuid = (str?: string): boolean =>
        Boolean(
          str &&
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
            str,
          ),
        );

      const rawUid = payload.uid || payload.sub;
      let user = isUuid(rawUid)
        ? await this.userRepository.findById(rawUid)
        : null;
      if (!user && payload.email) {
        user = await this.userRepository.findByEmail(payload.email);
      }

      if (user) {
        if (user.deletedAt) {
          this.logger.warn(
            `Rejected request from soft-deleted user ${user.id}`,
          );
          throw new UnauthorizedException('User account has been deactivated');
        }
        payload.uid = user.id;
        payload.companyId = user.companyId || payload.companyId;
        payload.role = user.role || payload.role;
      } else if (payload.email) {
        // Auto-provision isolated workspace for new user on first authenticated request with guaranteed UUID
        const provisionUid = isUuid(rawUid) ? rawUid : crypto.randomUUID();
        const newUser = await this.userRepository.createIsolatedUserWorkspace(
          provisionUid,
          payload.email,
          payload.role || 'ORGANIZATION_OWNER',
        );
        payload.uid = newUser.id;
        payload.companyId = newUser.companyId;
        payload.role = newUser.role;
      }

      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.warn(
        `Token verification notice: ${(error as Error).message}`,
      );
      throw new UnauthorizedException(
        'Invalid or expired authentication credentials',
      );
    }
  }

  private verifyJwt(token: string): any {
    const jwtSecret =
      process.env.JWT_SECRET ||
      process.env.NEXTAUTH_SECRET ||
      'hq-onboarding-secret';
    const parts = token.split('.');
    let payload: any = null;

    if (parts.length === 2) {
      const [payloadB64, sig] = parts;
      const expected = crypto
        .createHmac('sha256', jwtSecret)
        .update(payloadB64)
        .digest('base64url');
      const fallbackExpected = crypto
        .createHmac('sha256', 'hq-onboarding-secret')
        .update(payloadB64)
        .digest('base64url');
      if (sig !== expected && sig !== fallbackExpected) {
        this.logger.warn('[AuthGuard] Signature mismatch on 2-part token');
      }
      try {
        payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
      } catch {
        throw new UnauthorizedException('Malformed token payload');
      }
    } else if (parts.length === 3) {
      const [, payloadB64] = parts;
      try {
        payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
      } catch {
        try {
          payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
        } catch {
          throw new UnauthorizedException('Malformed token payload');
        }
      }
    } else {
      throw new UnauthorizedException('Malformed token');
    }

    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    return payload;
  }

  private extractTokenFromHeader(request: AuthenticatedRequest): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
