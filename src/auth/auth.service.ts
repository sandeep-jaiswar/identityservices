import { Injectable } from '@nestjs/common';
import { Issuer, Client } from 'openid-client';
import { TokenSet } from 'openid-client';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private _client: Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    this.initializeClient();
  }

  private async initializeClient(): Promise<void> {
    const issuerUrl = this.configService.get<string>('ISSUER_URL');
    const clientId = this.configService.get<string>('CLIENT_ID');
    const clientSecret = this.configService.get<string>('CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('REDIRECT_URI');
    const issuer = await Issuer.discover(issuerUrl);
    this._client = new issuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uris: [redirectUri],
      response_types: ['code'],
    });
  }

  public get client(): Client {
    return this._client;
  }

  async authenticate(code: string): Promise<TokenSet> {
    const tokenSet = await this.client.grant({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.configService.get<string>('REDIRECT_URI'),
    });
    return tokenSet;
  }

  async refresh(refreshToken: string): Promise<TokenSet> {
    const tokenSet = await this.client.refresh(refreshToken);
    return tokenSet;
  }

  async introspect(token: string) {
    const introspection = await this.client.introspect(token);
    return introspection;
  }

  async revoke(token: string) {
    await this.client.revoke(token);
  }

  async generateTokens(tokenSet: TokenSet): Promise<any> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const accessTokenExpiry = this.configService.get<string>(
      'ACCESS_TOKEN_EXPIRY',
    );
    const refreshTokenExpiry = this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRY',
    );
    const userInfo = await this.client.userinfo(tokenSet.access_token);
    const user = {
      email: userInfo.email,
      name: userInfo.name,
    };
    const accessToken = jwt.sign(user, jwtSecret, {
      expiresIn: accessTokenExpiry,
    });
    const refreshToken = jwt.sign(user, jwtSecret, {
      expiresIn: refreshTokenExpiry,
    });
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: tokenSet.expires_in,
    };
  }
}
