import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../common/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Config } from '../contants';
import { PasswordService } from '../../common/services/password.service';

@Injectable()
export class AuthService {
  constructor(
    private logger: Logger,
    private configService: ConfigService<Config>,
    private userService: UserService,
    private jwtService: JwtService,
    private passwordService: PasswordService,
  ) {}

  async login(
    login: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findByLogin(login);
    if (!user) {
      throw new UnauthorizedException('No such user ' + login);
    }
    const isValid = await this.passwordService.isValid(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.login };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
    });

    this.logger.log('New login ' + user.login);

    return { access_token: token };
  }
}
