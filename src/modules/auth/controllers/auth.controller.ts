import { Body, Controller, Get, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
import { CreateUserDto } from '../../user/dtos/create-user-dto';
import { UpdateUserDto } from '../../user/dtos/update-user-dto';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import { LoginDataDto } from '../dtos/login-data.dto';
import { LoginDto } from '../dtos/login.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('/signup')
  async signup(@Body() createUserDto: CreateUserDto): Promise<LoginDataDto> {
    return this.authService.signup(createUserDto);
  }

  @Public()
  @Post('/login')
  async login(@Body() loginDto: LoginDto): Promise<LoginDataDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('/refresh')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string }> {
    return await this.authService.refresh(refreshTokenDto.refreshToken);
  }

  @ApiBearerAuth()
  @Get('/me')
  async getProfile(@Req() req: AuthenticatedRequest): Promise<User> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }

    return this.authService.me(userId);
  }

  @ApiBearerAuth()
  @Put('/me')
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }

    return this.userService.update(userId, updateUserDto);
  }

  @ApiBearerAuth()
  @Post('/logout')
  async logout(@Req() req: AuthenticatedRequest): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }

    return this.authService.logout(userId);
  }
}
