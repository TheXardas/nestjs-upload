import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Config } from '../contants';
import { UserService } from '../../common/services/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private logger: Logger,
    private jwtService: JwtService,
    private configService: ConfigService<Config>,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token');
    }
    let tokenData;
    try {
      tokenData = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (e: any) {
      this.logger.error(e);
      throw new UnauthorizedException(e.message);
    }

    const user = await this.userService.findByLogin(tokenData.username);
    if (!user) {
      this.logger.error('Failed to find user from token ' + tokenData.username);
      throw new UnauthorizedException('User does not exist');
    }

    request['user'] = user;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
