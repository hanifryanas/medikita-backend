import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPatient } from '../user/entities/user-patient.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/services/user.service';
import { PatientInsuranceController } from './controllers/patient-insurance.controller';
import { PatientController } from './controllers/patient.controller';
import { PatientInsurance } from './entities/patient-insurance.entity';
import { Patient } from './entities/patient.entity';
import { PatientInsuranceService } from './services/patient-insurance.service';
import { PatientService } from './services/patient.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, PatientInsurance, UserPatient, User]),
  ],
  controllers: [PatientController, PatientInsuranceController],
  providers: [PatientService, PatientInsuranceService, UserService],
  exports: [PatientService, PatientInsuranceService],
})
export class PatientModule {}
