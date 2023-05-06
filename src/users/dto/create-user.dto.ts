export class CreateUserDto {
  sub: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  email?: string;
  picture?: string;
  emailVerified?: boolean;
}
