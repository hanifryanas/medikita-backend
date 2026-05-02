import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequiredRole } from '../../../common/decorators/required-role.decorator';
import { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
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
  async findByMe(@Req() req: AuthenticatedRequest): Promise<Patient[]> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }

    return await this.patientService.findAllByUserId(userId);
  }

  @RequiredRole(UserRole.Staff)
  @Get(':patientId')
  async findOne(@Param('patientId') patientId: string): Promise<Patient> {
    return await this.patientService.findOneBy('patientId', patientId);
  }

  @Post()
  async create(@Body() createPatientDto: CreatePatientDto): Promise<string> {
    const { userId, ...patientData } = createPatientDto;
    await this.userService.findOneBy({ userId });

    const patientId = await this.patientService.create(patientData);
    await this.patientService.linkUser(userId, patientId);

    return patientId;
  }

  @RequiredRole(UserRole.User)
  @Patch('me/order')
  async reorderMine(
    @Req() req: AuthenticatedRequest,
    @Body() reorderDto: ReorderPatientsDto,
  ): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }

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
