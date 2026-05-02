import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Not, Repository } from 'typeorm';
import { UserPatient } from '../../user/entities/user-patient.entity';
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
    const links = await this.userPatientRepository.find({
      where: { userId },
      order: { ordinal: 'ASC' },
      relations: { patient: true },
    });

    return links.map((link) => link.patient);
  }

  async create(patient: Partial<Patient>): Promise<string> {
    const createPatientDto = this.patientRepository.create(patient);
    const createdPatient = await this.patientRepository.save(createPatientDto);

    if (!createdPatient) {
      throw new BadRequestException('Failed to create patient');
    }

    return createdPatient.patientId;
  }

  async linkUser(userId: string, patientId: string): Promise<void> {
    const existing = await this.userPatientRepository.findOne({
      where: { userId, patientId },
    });
    if (existing) return;

    const last = await this.userPatientRepository.findOne({
      where: { userId },
      order: { ordinal: 'DESC' },
    });
    const nextOrdinal = (last?.ordinal ?? 0) + 1;

    await this.userPatientRepository.save(
      this.userPatientRepository.create({
        userId,
        patientId,
        ordinal: nextOrdinal,
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
    const patientIds = items.map((i) => i.patientId);

    if (patientIds.length > 0) {
      const existing = await this.userPatientRepository.find({
        where: { userId, patientId: In(patientIds) },
      });
      if (existing.length !== new Set(patientIds).size) {
        throw new BadRequestException(
          'Reorder payload contains patients not linked to this user',
        );
      }
    }

    await this.userPatientRepository.manager.transaction(async (manager) => {
      const repo = manager.getRepository(UserPatient);

      if (items.length > 0) {
        await repo.upsert(
          items.map((item) => ({
            userId,
            patientId: item.patientId,
            ordinal: item.ordinal,
          })),
          { conflictPaths: ['userId', 'patientId'] },
        );
      }

      await repo.delete({
        userId,
        ...(patientIds.length > 0 ? { patientId: Not(In(patientIds)) } : {}),
      });
    });
  }
}
