import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { addDays, addHours } from 'date-fns';
import { Repository } from 'typeorm';
import { UserToken } from '../entities/user-token.entity';
import { UserTokenType } from '../enums/user-token.enum';

@Injectable()
export class UserTokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(UserToken)
    private readonly userTokenRepository: Repository<UserToken>,
  ) {}

  private getRefreshTokenOptions(): JwtSignOptions {
    return {
      secret: this.configService.get<string>('token.refreshTokenSecret'),
      expiresIn: `${this.configService.get<number>('token.refreshTokenExpiration')}h`,
    };
  }

  private getExpirationDate(expireInHours: number): Date {
    return addHours(new Date(), expireInHours);
  }

  async createRefreshToken(userId: string): Promise<UserToken> {
    const tokenOptions = this.getRefreshTokenOptions();

    const expiredInHours = parseInt(tokenOptions.expiresIn as string, 10) || 0;

    const generatedRefreshToken = this.jwtService.sign(
      { userId },
      tokenOptions,
    );

    const userToken = this.userTokenRepository.create({
      user: { userId },
      token: generatedRefreshToken,
      type: UserTokenType.RefreshToken,
      expiredAt: this.getExpirationDate(expiredInHours),
    });

    return await this.userTokenRepository.save(userToken);
  }

  async createLongRefreshToken(userId: string): Promise<UserToken> {
    const tokenOptions = this.getRefreshTokenOptions();
    const REMEMBER_ME_DAYS = 30;

    const generatedRefreshToken = this.jwtService.sign(
      { userId },
      { secret: tokenOptions.secret, expiresIn: `${REMEMBER_ME_DAYS * 24}h` },
    );

    const userToken = this.userTokenRepository.create({
      user: { userId },
      token: generatedRefreshToken,
      type: UserTokenType.RefreshToken,
      expiredAt: addDays(new Date(), REMEMBER_ME_DAYS),
    });

    return await this.userTokenRepository.save(userToken);
  }

  async validateRefreshToken(refreshToken: string): Promise<string> {
    const userToken = await this.userTokenRepository.findOne({
      where: { token: refreshToken, type: UserTokenType.RefreshToken },
      relations: ['user'],
    });

    if (!userToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (userToken.expiredAt < new Date()) {
      await this.userTokenRepository.delete({
        userTokenId: userToken.userTokenId,
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    return userToken.user.userId;
  }

  async removeTokensByUserId(
    userId: string,
    tokenType: UserTokenType,
  ): Promise<void> {
    await this.userTokenRepository.delete({
      user: { userId },
      type: tokenType,
    });
  }
}
