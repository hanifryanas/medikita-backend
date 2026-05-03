import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator';
import { RequiredRole } from '../../../common/decorators/required-role.decorator';
import { UserRole } from '../../user/enums/user-role.enum';
import { UserService } from '../../user/services/user.service';
import { CreatePatientDto } from '../dtos/create-patient.dto';
import { FilterPatientDto } from '../dtos/filter-patient.dto';
import { ReorderPatientsDto } from '../dtos/reorder-patients.dto';
import { UpdatePatientDto } from '../dtos/update-patient.dto';
import { Patient } from '../entities/patient.entity';
import { PatientService } from '../services/patient.service';

@Controller('patients')
@ApiTags('Patient')
@ApiBearerAuth()
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
    private readonly userService: UserService,
  ) {}

  @RequiredRole(UserRole.Staff)
  @Get()
  async findAll(@Query() query: FilterPatientDto): Promise<Patient[]> {
    return await this.patientService.findBy(query);
  }

  @RequiredRole(UserRole.User)
  @Get('me')
  async findByMe(@CurrentUserId() userId: string): Promise<Patient[]> {
    return await this.patientService.findAllByUserId(userId);
  }

  @RequiredRole(UserRole.Staff)
  @Get(':patientId')
  async findOne(@Param('patientId') patientId: string): Promise<Patient> {
    return await this.patientService.findOneBy('patientId', patientId);
  }

  @Post()
  async create(@Body() createPatientDto: CreatePatientDto): Promise<string> {
    const { userId, relationship, ...patientData } = createPatientDto;
    await this.userService.findOneBy({ userId });

    const patientId = await this.patientService.create(patientData);
    await this.patientService.linkUser(userId, patientId, relationship);

    return patientId;
  }

  @RequiredRole(UserRole.User)
  @Patch('me/order')
  async reorderMine(
    @CurrentUserId() userId: string,
    @Body() reorderDto: ReorderPatientsDto,
  ): Promise<void> {
    await this.patientService.reorderForUser(userId, reorderDto.items);
  }

  @RequiredRole(UserRole.Staff)
  @Patch(':patientId')
  async update(
    @Param('patientId') patientId: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<void> {
    await this.patientService.update(patientId, updatePatientDto);
  }

  @RequiredRole(UserRole.Staff)
  @Delete(':patientId')
  async delete(@Param('patientId') patientId: string): Promise<void> {
    await this.patientService.delete(patientId);
  }
}
