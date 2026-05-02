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
import { CreateDoctorDto } from '../dtos/create-doctor.dto';
import { UpdateDoctorDto } from '../dtos/update-doctor.dto';
import { Doctor } from '../entities/doctor.entity';
import { DoctorService } from '../services/doctor.service';

@Controller('doctors')
@ApiTags('Doctor')
@ApiBearerAuth()
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @RequiredRole(UserRole.Admin)
  @Get()
  async findAll(): Promise<Doctor[]> {
    return this.doctorService.findAll();
  }

  @RequiredRole(UserRole.Staff)
  @Get('me')
  async findMe(@CurrentUserId() userId: string): Promise<Doctor> {
    return this.doctorService.findByUserId(userId);
  }

  @RequiredRole(UserRole.Admin)
  @Get(':doctorId')
  async findOneById(@Param('doctorId') doctorId: string): Promise<Doctor> {
    return this.doctorService.findById(doctorId);
  }

  @RequiredRole(UserRole.SuperAdmin)
  @Post()
  async create(@Body() createDoctorDto: CreateDoctorDto): Promise<string> {
    return this.doctorService.create(createDoctorDto);
  }

  @RequiredRole(UserRole.Staff)
  @Put('me')
  async updateMe(
    @CurrentUserId() userId: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ): Promise<void> {
    await this.doctorService.update(userId, updateDoctorDto);
  }

  @RequiredRole(UserRole.Admin)
  @Put(':doctorId')
  async update(
    @Param('doctorId') doctorId: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ): Promise<void> {
    await this.doctorService.update(doctorId, updateDoctorDto);
  }

  @RequiredRole(UserRole.Staff)
  @Delete('me')
  async deleteMe(@CurrentUserId() userId: string): Promise<void> {
    return this.doctorService.deleteByUserId(userId);
  }

  @RequiredRole(UserRole.Admin)
  @Delete(':doctorId')
  async delete(@Param('doctorId') doctorId: string): Promise<void> {
    return this.doctorService.delete(doctorId);
  }
}
