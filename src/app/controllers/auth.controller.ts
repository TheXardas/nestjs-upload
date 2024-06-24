import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { IsNotEmpty } from 'class-validator';

export class LoginDTO {
  @IsNotEmpty()
  login: string;

  @IsNotEmpty()
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() signInDto: LoginDTO): Promise<{ access_token: string }> {
    return this.authService.login(signInDto.login, signInDto.password);
  }
}
