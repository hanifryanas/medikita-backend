import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  SerializeOptions,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { RequiredRole } from '../../../common/decorators/required-role.decorator';
import { UserRole } from '../../user/enums/user-role.enum';
import { CreateNurseDto } from '../dtos/create-nurse.dto';
import { UpdateNurseDto } from '../dtos/update-nurse.dto';
import { Nurse } from '../entities/nurse.entity';
import { NurseService } from '../services/nurse.service';

@Controller('nurses')
@ApiTags('Nurse')
export class NurseController {
  constructor(private readonly nurseService: NurseService) {}

  @Public()
  @Get()
  @SerializeOptions({ groups: ['nurse-day-schedule'] })
  async findAll(): Promise<Nurse[]> {
    return this.nurseService.findAll();
  }

  @ApiBearerAuth()
  @RequiredRole(UserRole.Admin)
  @Get('full')
  @SerializeOptions({ groups: ['user-full'] })
  async findAllFull(): Promise<Nurse[]> {
    return this.nurseService.findAll();
  }

  @ApiBearerAuth()
  @RequiredRole(UserRole.CareTeam)
  @Get('me')
  async findMe(@CurrentUserId() userId: string): Promise<Nurse> {
    return this.nurseService.findByUserId(userId);
  }

  @Public()
  @Get(':nurseId')
  @SerializeOptions({ groups: ['nurse-schedule', 'schedule-time-slots'] })
  async findOneById(@Param('nurseId') nurseId: string): Promise<Nurse> {
    return this.nurseService.findById(nurseId);
  }

  @ApiBearerAuth()
  @RequiredRole(UserRole.SuperAdmin)
  @Post()
  async create(@Body() createNurseDto: CreateNurseDto): Promise<string> {
    return this.nurseService.create(createNurseDto);
  }

  @ApiBearerAuth()
  @RequiredRole(UserRole.CareTeam)
  @Put('me')
  async updateMe(
    @CurrentUserId() userId: string,
    @Body() updateNurseDto: UpdateNurseDto,
  ): Promise<void> {
    await this.nurseService.updateByUserId(userId, updateNurseDto);
  }

  @ApiBearerAuth()
  @RequiredRole(UserRole.CareTeam)
  @Put(':nurseId')
  async update(
    @Param('nurseId') nurseId: string,
    @Body() updateNurseDto: UpdateNurseDto,
  ): Promise<void> {
    await this.nurseService.update(nurseId, updateNurseDto);
  }

  @ApiBearerAuth()
  @RequiredRole(UserRole.CareTeam)
  @Delete('me')
  async deleteMe(@CurrentUserId() userId: string): Promise<void> {
    return this.nurseService.deleteByUserId(userId);
  }

  @ApiBearerAuth()
  @RequiredRole(UserRole.SuperAdmin)
  @Delete(':nurseId')
  async deleteById(@Param('nurseId') nurseId: string): Promise<void> {
    return this.nurseService.delete(nurseId);
  }
}
