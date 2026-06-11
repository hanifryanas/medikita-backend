import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsSelect, Repository } from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity';
import { EmployeeService } from '../../employee/services/employee.service';
import {
  DOCTOR_DETAIL_SELECTION,
  DOCTOR_LIST_SELECTION,
} from '../constants/doctor.selection';
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
    const doctor = await this.doctorRepository.findOne({
      where: { doctorId },
      relations: {
        employee: { user: true, department: true },
        appointments: { patient: true },
      },
      select: DOCTOR_DETAIL_SELECTION,
    });

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
    field?: keyof Doctor,
    value?: Doctor[keyof Doctor],
    selection?: (keyof Doctor)[],
    orderBy: FindOptionsOrder<Doctor> = {
      employee: { startDate: 'ASC' },
      schedules: { day: 'ASC', startTime: 'ASC' },
    },
  ): Promise<Doctor[]> {
    const select: FindOptionsSelect<Doctor> = selection
      ? Object.fromEntries(selection.map((key) => [key, true]))
      : DOCTOR_LIST_SELECTION;

    if (field && value) {
      return await this.doctorRepository.find({
        where: { [field]: value },
        relations: {
          employee: { user: true, department: true },
          schedules: true,
        },
        select,
        order: orderBy,
      });
    }

    return await this.doctorRepository.find({
      relations: {
        employee: { user: true, department: true },
        schedules: true,
      },
      select,
      order: orderBy,
    });
  }

  async create(createDoctorDto: CreateDoctorDto): Promise<string> {
    return await this.doctorRepository.manager.transaction(async (manager) => {
      const employeeRepository = manager.getRepository(Employee);
      const doctorRepository = manager.getRepository(Doctor);

      let resolvedEmployeeId: string | undefined = undefined;

      if (createDoctorDto.userId) {
        const existingEmployee = await this.employeeService.findOneByUserId(
          createDoctorDto.userId,
          ['employeeId'],
        );
        resolvedEmployeeId = existingEmployee.employeeId;
      } else {
        const newEmployee = employeeRepository.create(createDoctorDto);
        const createdEmployee = await employeeRepository.save(newEmployee);
        resolvedEmployeeId = createdEmployee?.employeeId;
      }

      if (!resolvedEmployeeId) {
        throw new BadRequestException('Failed to create employee');
      }

      const newDoctor = doctorRepository.create({
        ...createDoctorDto,
        employee: { employeeId: resolvedEmployeeId },
      });

      const createdDoctor = await doctorRepository.save(newDoctor);

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

    await this.doctorRepository.update(doctor.doctorId, updateDoctorDto);
  }

  async updateByUserId(
    userId: string,
    updateDoctorDto: UpdateDoctorDto,
  ): Promise<void> {
    const doctor = await this.findByUserId(userId);

    await this.doctorRepository.update(doctor.doctorId, updateDoctorDto);
  }

  async deleteByUserId(userId: string): Promise<void> {
    const doctor = await this.findByUserId(userId);

    await this.doctorRepository.remove(doctor);
  }

  async deleteByEmployeeId(employeeId: string): Promise<void> {
    const doctor = await this.findByEmployeeId(employeeId);

    await this.doctorRepository.remove(doctor);
  }

  async delete(doctorId: string): Promise<void> {
    const doctor = await this.findById(doctorId);

    await this.doctorRepository.remove(doctor);
  }
}
