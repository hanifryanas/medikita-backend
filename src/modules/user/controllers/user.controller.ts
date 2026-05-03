import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  SerializeOptions,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequiredRole } from '../../../common/decorators/required-role.decorator';
import { CreateUserDto } from '../dtos/create-user-dto';
import { FilterUserDto } from '../dtos/filter-user.dto';
import { UpdateUserDto } from '../dtos/update-user-dto';
import { User } from '../entities/user.entity';
import { UserRole } from '../enums/user-role.enum';
import { UserService } from '../services/user.service';

@Controller('users')
@ApiTags('User')
@ApiBearerAuth()
@RequiredRole(UserRole.Staff)
@SerializeOptions({ groups: ['user-full'] })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query() query: FilterUserDto): Promise<User[]> {
    const filterUser: Partial<User> = {
      ...query,
    };

    return await this.userService.findBy(filterUser);
  }

  @Get(':userId')
  async findOne(@Param('userId') userId: string): Promise<User> {
    return await this.userService.findOneBy({ userId });
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<string> {
    return await this.userService.create(createUserDto);
  }

  @Put(':userId')
  async update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<void> {
    await this.userService.update(userId, updateUserDto);
  }

  @Delete(':userId')
  async delete(@Param('userId') userId: string): Promise<void> {
    await this.userService.delete(userId);
  }
}
