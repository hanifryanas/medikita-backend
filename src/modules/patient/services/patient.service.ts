import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Not, Repository } from 'typeorm';
import { UserPatient } from '../../user/entities/user-patient.entity';
import { UserRelationship } from '../../user/enums/user-relationship.enum';
import { FilterPatientDto } from '../dtos/filter-patient.dto';
import { ReorderPatientItemDto } from '../dtos/reorder-patients.dto';
import { UpdatePatientDto } from '../dtos/update-patient.dto';
import { Patient } from '../entities/patient.entity';
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(UserPatient)
    private readonly userPatientRepository: Repository<UserPatient>,
  ) {}

  async findAll(): Promise<Patient[]> {
    return await this.patientRepository.find();
  }

  async findBy(filterPatientDto: FilterPatientDto): Promise<Patient[]> {
    const { name, address, phoneNumber, insuranceProvider } = filterPatientDto;
    const namePattern = name ? ILike(`%${name}%`) : undefined;

    const baseWhere = {
      address: address ? ILike(`%${address}%`) : undefined,
      phoneNumber: phoneNumber,
      insurances: insuranceProvider ? { insuranceProvider } : undefined,
    };

    if (!name) {
      return await this.patientRepository.find({ where: baseWhere });
    }

    return await this.patientRepository.find({
      where: [
        { ...baseWhere, firstName: namePattern },
        { ...baseWhere, lastName: namePattern },
      ],
    });
  }

  async findOneBy(
    patientField: keyof Patient,
    patientValue: Patient[keyof Patient],
  ): Promise<Patient> {
    const patient = await this.patientRepository.findOneBy({
      [patientField]: patientValue,
    });

    if (!patient) {
      throw new NotFoundException(
        `Patient with ${patientField}=${String(patientValue)} not found`,
      );
    }

    return patient;
  }

  async findAllByUserId(userId: string): Promise<Patient[]> {
    const userPatients = await this.userPatientRepository.find({
      where: { userId },
      order: { ordinal: 'ASC' },
      relations: { patient: true },
    });

    return userPatients.map(({ patient, relationship, ordinal }) => {
      patient.relationship = relationship;
      patient.ordinal = ordinal;
      return patient;
    });
  }

  async findOneByUserAndPatientId(
    userId: string,
    patientId: string,
  ): Promise<Patient> {
    const userPatient = await this.userPatientRepository.findOne({
      where: { userId, patientId },
      relations: { patient: true },
    });

    if (!userPatient) {
      throw new NotFoundException(
        `Patient with ID ${patientId} not linked to this user`,
      );
    }

    const { patient, relationship, ordinal } = userPatient;
    patient.relationship = relationship;
    patient.ordinal = ordinal;
    return patient;
  }

  async create(patient: Partial<Patient>): Promise<string> {
    const newPatient = this.patientRepository.create(patient);
    const createdPatient = await this.patientRepository.save(newPatient);

    if (!createdPatient) {
      throw new BadRequestException('Failed to create patient');
    }

    return createdPatient.patientId;
  }

  async linkUser(
    userId: string,
    patientId: string,
    relationship: UserRelationship,
  ): Promise<void> {
    const existingUserPatient = await this.userPatientRepository.findOne({
      where: { userId, patientId },
    });
    if (existingUserPatient) return;

    const nextOrdinal =
      (await this.userPatientRepository.count({ where: { userId } })) + 1;

    await this.userPatientRepository.save(
      this.userPatientRepository.create({
        userId,
        patientId,
        ordinal: nextOrdinal,
        relationship,
      }),
    );
  }

  async delete(patientId: string): Promise<void> {
    const result = await this.patientRepository.softDelete(patientId);

    if (!result.affected) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }
  }

  async update(patientId: string, dto: UpdatePatientDto): Promise<void> {
    const result = await this.patientRepository.update(patientId, dto);

    if (!result.affected) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }
  }

  async reorderForUser(
    userId: string,
    items: ReorderPatientItemDto[],
  ): Promise<void> {
    const requestedPatientIds = items.map((item) => item.patientId);

    if (requestedPatientIds.length > 0) {
      const linkedUserPatients = await this.userPatientRepository.find({
        where: { userId, patientId: In(requestedPatientIds) },
      });
      if (linkedUserPatients.length !== new Set(requestedPatientIds).size) {
        throw new BadRequestException(
          'Reorder payload contains patients not linked to this user',
        );
      }
    }

    await this.userPatientRepository.manager.transaction(async (manager) => {
      const userPatientRepository = manager.getRepository(UserPatient);

      if (items.length > 0) {
        await userPatientRepository.upsert(
          items.map((item) => ({
            userId,
            patientId: item.patientId,
            ordinal: item.ordinal,
          })),
          { conflictPaths: ['userId', 'patientId'] },
        );
      }

      await userPatientRepository.delete({
        userId,
        ...(requestedPatientIds.length > 0
          ? { patientId: Not(In(requestedPatientIds)) }
          : {}),
      });
    });
  }
}
