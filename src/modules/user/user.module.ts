import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserToken } from './entities/user-token.entity';
import { User } from './entities/user.entity';
import { UserTokenService } from './services/user-token.service';
import { UserService } from './services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('token.accessTokenSecret'),
        signOptions: {
          expiresIn: `${configService.get<number>('token.accessTokenExpiration')}h`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [UserService, UserTokenService],
  controllers: [UserController],
  exports: [UserService, UserTokenService, JwtModule],
})
export class UserModule {}
