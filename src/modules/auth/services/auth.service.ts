import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../../user/dtos/create-user-dto';
import { User } from '../../user/entities/user.entity';
import { UserTokenType } from '../../user/enums/user-token.enum';
import { UserTokenService } from '../../user/services/user-token.service';
import { UserService } from '../../user/services/user.service';
import { SigninDataDto } from '../dtos/signin-data.dto';
import { SigninDto } from '../dtos/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly userTokenService: UserTokenService,
  ) {}

  async signin(signinDto: SigninDto): Promise<SigninDataDto> {
    const validatedUser =
      await this.userService.validateUserCredential(signinDto);

    const createdAccessToken = this.jwtService.sign(validatedUser);

    const userToken = signinDto.isRemember
      ? await this.userTokenService.createLongRefreshToken(validatedUser.userId)
      : await this.userTokenService.createRefreshToken(validatedUser.userId);

    const refreshToken = userToken.token;

    return {
      ...validatedUser,
      accessToken: createdAccessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const userId =
      await this.userTokenService.validateRefreshToken(refreshToken);

    const user = await this.userService.findOneBy({ userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const payload: SigninDataDto = {
      userId: user.userId,
      username: user.userName,
      role: user.role,
    };

    return { accessToken: this.jwtService.sign(payload) };
  }

  async signup(createUserDto: CreateUserDto): Promise<SigninDataDto> {
    await this.userService.create(createUserDto);

    const signinDto: SigninDto = {
      identifier: createUserDto.userName,
      password: createUserDto.password,
    };

    return this.signin(signinDto);
  }

  async me(userId: string): Promise<User> {
    const user = await this.userService.findOneBy({ userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async signout(userId: string): Promise<void> {
    await this.userTokenService.removeTokensByUserId(
      userId,
      UserTokenType.RefreshToken,
    );
  }
}
