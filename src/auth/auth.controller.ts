import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}

  @Get('login')
  async login(@Res() res: Response): Promise<void> {
    const authorizationUrl = this.authService.client.authorizationUrl({
      scope: 'openid email profile',
      response_mode: 'form_post',
    });
    res.redirect(authorizationUrl);
  }

  @Post('callback')
  async callback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const params = this.authService.client.callbackParams(req);
    const tokenSet = await this.authService.client.callback(
      this.configService.get<string>('REDIRECT_URI'),
      params,
    );

    const { access_token, refresh_token } =
      await this.authService.generateTokens(tokenSet);
    const idTokenClaims = tokenSet.claims();
    const user: CreateUserDto = idTokenClaims;
    user.sub = idTokenClaims.sub;
    user.name = idTokenClaims.name;
    user.givenName = idTokenClaims.given_name;
    user.familyName = idTokenClaims.family_name;
    user.email = idTokenClaims.email;
    user.picture = idTokenClaims.picture;
    user.emailVerified = idTokenClaims.email_verified;
    const data = await this.userService.createOrUpdateUser(user);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      domain: '.vercel.app',
    });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      domain: '.vercel.app',
    });
    res.send(data);
  }
}
