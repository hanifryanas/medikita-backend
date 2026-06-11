import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientInsurance } from '../entities/patient-insurance.entity';

@Injectable()
export class PatientInsuranceService {
  constructor(
    @InjectRepository(PatientInsurance)
    private readonly patientInsuranceRepository: Repository<PatientInsurance>,
  ) {}

  async findAll(): Promise<PatientInsurance[]> {
    return await this.patientInsuranceRepository.find({
      relations: { patient: true },
    });
  }

  async findByPatientId(patientId: string): Promise<PatientInsurance[]> {
    return await this.patientInsuranceRepository.find({
      where: { patient: { patientId } },
      relations: { patient: true },
    });
  }

  async findOne(patientInsuranceId: number): Promise<PatientInsurance> {
    const patientInsurance = await this.patientInsuranceRepository.findOne({
      where: { patientInsuranceId },
      relations: { patient: true },
    });

    if (!patientInsurance) {
      throw new NotFoundException(
        `Patient insurance with ID ${patientInsuranceId} not found`,
      );
    }

    return patientInsurance;
  }

  async create(
    patientInsurance: Partial<PatientInsurance>,
  ): Promise<PatientInsurance> {
    const newPatientInsurance =
      this.patientInsuranceRepository.create(patientInsurance);
    const createdPatientInsurance =
      await this.patientInsuranceRepository.save(newPatientInsurance);

    if (!createdPatientInsurance) {
      throw new BadRequestException('Failed to create patient insurance');
    }

    return createdPatientInsurance;
  }

  async update(
    patientInsuranceId: number,
    patientInsurance: Partial<PatientInsurance>,
  ): Promise<void> {
    const result = await this.patientInsuranceRepository.update(
      patientInsuranceId,
      patientInsurance,
    );

    if (!result.affected) {
      throw new BadRequestException(
        `Failed to update patient insurance with ID ${patientInsuranceId}`,
      );
    }
  }

  async delete(patientInsuranceId: number): Promise<void> {
    const result =
      await this.patientInsuranceRepository.softDelete(patientInsuranceId);

    if (!result.affected) {
      throw new BadRequestException(
        `Failed to delete patient insurance with ID ${patientInsuranceId}`,
      );
    }
  }

  async deleteByPatientId(patientId: string): Promise<void> {
    const result = await this.patientInsuranceRepository.softDelete({
      patient: { patientId },
    });

    if (!result.affected) {
      throw new BadRequestException(
        `Failed to delete patient insurance for patient with ID ${patientId}`,
      );
    }
  }
}
