import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator';
import { RequiredRole } from '../../../common/decorators/required-role.decorator';
import { UserRole } from '../../user/enums/user-role.enum';
import { CreateNurseDto } from '../dtos/create-nurse.dto';
import { Nurse } from '../entities/nurse.entity';
import { NurseService } from '../services/nurse.service';

@Controller('nurses')
@ApiTags('Nurse')
@ApiBearerAuth()
export class NurseController {
  constructor(private readonly nurseService: NurseService) {}

  @RequiredRole(UserRole.Admin)
  @Get()
  async findAll(): Promise<Nurse[]> {
    return this.nurseService.findAll();
  }

  @RequiredRole(UserRole.Staff)
  @Get('me')
  async findMe(@CurrentUserId() userId: string): Promise<Nurse> {
    return this.nurseService.findByUserId(userId);
  }

  @RequiredRole(UserRole.Admin)
  @Get(':nurseId')
  async findOneById(@Param('nurseId') nurseId: string): Promise<Nurse> {
    return this.nurseService.findById(nurseId);
  }

  @RequiredRole(UserRole.SuperAdmin)
  @Post()
  async create(@Body() createNurseDto: CreateNurseDto): Promise<string> {
    return this.nurseService.create(createNurseDto);
  }

  @RequiredRole(UserRole.Staff)
  @Put('me')
  async updateMe(
    @CurrentUserId() userId: string,
    @Body() updateNurseDto: CreateNurseDto,
  ): Promise<void> {
    await this.nurseService.update(userId, updateNurseDto);
  }

  @RequiredRole(UserRole.Admin)
  @Put(':nurseId')
  async update(
    @Param('nurseId') nurseId: string,
    @Body() updateNurseDto: CreateNurseDto,
  ): Promise<void> {
    await this.nurseService.update(nurseId, updateNurseDto);
  }

  @RequiredRole(UserRole.Staff)
  @Delete('me')
  async deleteMe(@CurrentUserId() userId: string): Promise<void> {
    return this.nurseService.deleteByUserId(userId);
  }

  @RequiredRole(UserRole.Admin)
  @Delete(':nurseId')
  async deleteById(@Param('nurseId') nurseId: string): Promise<void> {
    return this.nurseService.delete(nurseId);
  }
}
