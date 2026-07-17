import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { UserRepository } from '../user/user.repository';
import { AuthenticatedRequest } from '../../common/interfaces/request.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly userRepository: UserRepository,
  ) {}

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
      const payload = await this.firebaseService.verifyIdToken(token);
      
      // If claims do not have companyId or role, resolve them from PostgreSQL
      if (!payload.companyId || !payload.role) {
        const user = await this.userRepository.findById(payload.uid);
        if (user) {
          payload.companyId = user.companyId || payload.companyId;
          payload.role = user.role || payload.role;
        } else {
          const defaultCompany = await this.userRepository.findDefaultCompany();
          if (defaultCompany) {
            payload.companyId = defaultCompany.id;
          }
        }
      }

      request.user = payload;
      return true;
    } catch (error) {
      this.logger.warn(
        `Token verification failed: ${(error as Error).message}`,
      );
      throw new UnauthorizedException(
        'Invalid or expired authentication credentials',
      );
    }
  }

  private extractTokenFromHeader(request: AuthenticatedRequest): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
