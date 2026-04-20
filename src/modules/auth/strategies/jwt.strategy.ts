import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../../user/enums/user-role.enum';
import { SigninDataDto } from '../dtos/signin-data.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('token.accessTokenSecret'),
    });
  }

  validate(payload: {
    userId: string;
    username: string;
    role: UserRole;
  }): SigninDataDto {
    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    };
  }
}
