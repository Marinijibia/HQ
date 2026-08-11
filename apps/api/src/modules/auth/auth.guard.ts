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

  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('Authentication token missing from request headers');
      throw new UnauthorizedException('Request lacks authentication credentials');
    }

    try {
      // Verify our HMAC-SHA256 signed JWT — no external service needed
      const payload = this.verifyJwt(token);

      const targetUid = payload.uid || payload.sub;
      let user = targetUid ? await this.userRepository.findById(targetUid) : null;
      if (!user && payload.email) {
        user = await this.userRepository.findByEmail(payload.email);
      }

      if (user) {
        if (user.deletedAt) {
          this.logger.warn(`Rejected request from soft-deleted user ${user.id}`);
          throw new UnauthorizedException('User account has been deactivated');
        }
        payload.uid = user.id;
        payload.companyId = user.companyId || payload.companyId;
        payload.role = user.role || payload.role;
      } else if (payload.email) {
        // Auto-create user on first authenticated request (e.g. onboarding set-password flow)
        let defaultCompany = await this.userRepository.findDefaultCompany();
        if (!defaultCompany) {
          defaultCompany = await this.userRepository.createDefaultCompany();
        }
        const newUser = await this.userRepository.create({
          id: payload.uid,
          email: payload.email,
          name: payload.email.split('@')[0] || 'HQ User',
          displayName: payload.email.split('@')[0] || 'HQ User',
          companyId: defaultCompany.id,
          role: payload.role || 'MEMBER',
        });
        payload.companyId = newUser.companyId;
        payload.role = newUser.role;
      }

      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.warn(`Token verification failed: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid or expired authentication credentials');
    }
  }

  private verifyJwt(token: string): any {
    const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'hq-onboarding-secret';
    const parts = token.split('.');
    if (parts.length !== 2) throw new UnauthorizedException('Malformed token');
    const [payloadB64, sig] = parts;
    const expected = crypto.createHmac('sha256', jwtSecret).update(payloadB64).digest('base64url');
    if (sig !== expected) throw new UnauthorizedException('Invalid token signature');
    let payload: any;
    try {
      payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    } catch {
      throw new UnauthorizedException('Malformed token payload');
    }
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token has expired');
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
