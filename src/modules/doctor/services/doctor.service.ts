import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity';
import { EmployeeService } from '../../employee/services/employee.service';
import { CreateDoctorDto } from '../dtos/create-doctor.dto';
import { UpdateDoctorDto } from '../dtos/update-doctor.dto';
import { Doctor } from '../entities/doctor.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    private readonly employeeService: EmployeeService,
  ) {}

  async findById(doctorId: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({ where: { doctorId } });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    return doctor;
  }

  async findByEmployeeId(employeeId: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: {
        employee: {
          employeeId: employeeId,
        },
      },
      relations: { employee: true },
    });

    if (!doctor) {
      throw new NotFoundException(
        `Doctor with Employee ID ${employeeId} not found`,
      );
    }

    return doctor;
  }

  async findByUserId(userId: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: {
        employee: {
          user: {
            userId: userId,
          },
        },
      },
      relations: { employee: { user: true } },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with User ID ${userId} not found`);
    }

    return doctor;
  }

  async findAll(
    key?: keyof Doctor,
    value?: Doctor[keyof Doctor],
    selection?: (keyof Doctor)[],
  ): Promise<Doctor[]> {
    if (key && value) {
      return await this.doctorRepository.find({
        where: { [key]: value },
        relations: { employee: { user: true } },
        select: selection,
      });
    }

    return await this.doctorRepository.find({
      relations: { employee: { user: true } },
      select: selection,
    });
  }

  async create(createDoctorDto: CreateDoctorDto): Promise<string> {
    const { ...employeeData } = createDoctorDto;

    return await this.doctorRepository.manager.transaction(async (manager) => {
      const employeeRepo = manager.getRepository(Employee);
      const doctorRepo = manager.getRepository(Doctor);

      let currentEmployeeId: string | undefined = undefined;

      if (employeeData.userId) {
        const currentEmployee = await this.employeeService.findOneByUserId(
          employeeData.userId,
          ['employeeId'],
        );
        currentEmployeeId = currentEmployee.employeeId;
      } else {
        const newEmployee = employeeRepo.create(employeeData);
        const createdEmployee = await employeeRepo.save(newEmployee);
        currentEmployeeId = createdEmployee?.employeeId;
      }

      if (!currentEmployeeId) {
        throw new BadRequestException('Failed to create employee');
      }

      const createDoctor = doctorRepo.create({
        ...createDoctorDto,
        employee: { employeeId: currentEmployeeId },
      });

      const createdDoctor = await doctorRepo.save(createDoctor);

      if (!createdDoctor) {
        throw new BadRequestException('Failed to create doctor');
      }

      return createdDoctor.doctorId;
    });
  }

  async update(
    doctorId: string,
    updateDoctorDto: UpdateDoctorDto,
  ): Promise<void> {
    const doctor = await this.findById(doctorId);

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    await this.doctorRepository.update(doctor.doctorId, updateDoctorDto);
  }

  async deleteByUserId(userId: string): Promise<void> {
    const doctor = await this.findByUserId(userId);

    if (!doctor) {
      throw new NotFoundException(`Doctor with User ID ${userId} not found`);
    }

    await this.doctorRepository.remove(doctor);
  }

  async deleteByEmployeeId(employeeId: string): Promise<void> {
    const doctor = await this.findByEmployeeId(employeeId);

    if (!doctor) {
      throw new NotFoundException(
        `Doctor with Employee ID ${employeeId} not found`,
      );
    }

    await this.doctorRepository.remove(doctor);
  }

  async delete(doctorId: string): Promise<void> {
    const doctor = await this.findById(doctorId);

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    await this.doctorRepository.remove(doctor);
  }
}
