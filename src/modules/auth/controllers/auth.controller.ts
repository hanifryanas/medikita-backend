import { Body, Controller, Get, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
import { CreateUserDto } from '../../user/dtos/create-user-dto';
import { UpdateUserDto } from '../../user/dtos/update-user-dto';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { SigninDataDto } from '../dtos/signin-data.dto';
import { SigninDto } from '../dtos/signin.dto';
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
  async signup(@Body() createUserDto: CreateUserDto): Promise<SigninDataDto> {
    return this.authService.signup(createUserDto);
  }

  @Public()
  @Post('/signin')
  @ApiBody({
    type: SigninDto,
    description: 'Sign in using email, username, or phone number',
  })
  async signin(@Body() signinDto: SigninDto): Promise<SigninDataDto> {
    return this.authService.signin(signinDto);
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

    return this.authService.me(userId);
  }

  @ApiBearerAuth()
  @Put('/me')
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<void> {
    const userId = req.user?.userId;

    return this.userService.update(userId, updateUserDto);
  }

  @ApiBearerAuth()
  @Post('/signout')
  async signout(@Req() req: AuthenticatedRequest): Promise<void> {
    const userId = req.user?.userId;

    return this.authService.signout(userId);
  }
}
