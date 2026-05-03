import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity';
import { EmployeeService } from '../../employee/services/employee.service';
import { CreateNurseDto } from '../dtos/create-nurse.dto';
import { UpdateNurseDto } from '../dtos/update-nurse.dto';
import { Nurse } from '../entities/nurse.entity';

@Injectable()
export class NurseService {
  constructor(
    @InjectRepository(Nurse)
    private readonly nurseRepository: Repository<Nurse>,
    private readonly employeeService: EmployeeService,
  ) {}

  async findById(nurseId: string): Promise<Nurse> {
    const nurse = await this.nurseRepository.findOne({ where: { nurseId } });

    if (!nurse) {
      throw new NotFoundException(`Nurse with ID ${nurseId} not found`);
    }

    return nurse;
  }

  async findByEmployeeId(employeeId: string): Promise<Nurse> {
    const nurse = await this.nurseRepository.findOne({
      where: {
        employee: {
          employeeId: employeeId,
        },
      },
      relations: { employee: true },
    });

    if (!nurse) {
      throw new NotFoundException(
        `Nurse with employee ID ${employeeId} not found`,
      );
    }

    return nurse;
  }

  async findByUserId(userId: string): Promise<Nurse> {
    const nurse = await this.nurseRepository.findOne({
      where: {
        employee: {
          user: {
            userId: userId,
          },
        },
      },
      relations: { employee: { user: true } },
    });

    if (!nurse) {
      throw new NotFoundException(`Nurse with User ID ${userId} not found`);
    }

    return nurse;
  }

  async findAll(
    field?: keyof Nurse,
    value?: Nurse[keyof Nurse],
    selection?: (keyof Nurse)[],
  ): Promise<Nurse[]> {
    if (field && value) {
      return await this.nurseRepository.find({
        where: { [field]: value },
        select: selection,
      });
    }

    return await this.nurseRepository.find({
      relations: { employee: { user: true } },
      select: selection,
    });
  }

  async create(createNurseDto: CreateNurseDto): Promise<string> {
    const { title, ...employeeData } = createNurseDto;

    return await this.nurseRepository.manager.transaction(async (manager) => {
      const employeeRepository = manager.getRepository(Employee);
      const nurseRepository = manager.getRepository(Nurse);

      let resolvedEmployeeId: string | undefined = undefined;

      if (employeeData.userId) {
        const existingEmployee = await this.employeeService.findOneByUserId(
          employeeData.userId,
          ['employeeId'],
        );
        resolvedEmployeeId = existingEmployee.employeeId;
      } else {
        const newEmployee = employeeRepository.create(employeeData);
        const createdEmployee = await employeeRepository.save(newEmployee);
        resolvedEmployeeId = createdEmployee?.employeeId;
      }

      if (!resolvedEmployeeId) {
        throw new BadRequestException('Failed to create employee for nurse');
      }

      const newNurse = nurseRepository.create({
        title,
        employee: { employeeId: resolvedEmployeeId },
      });

      const createdNurse = await nurseRepository.save(newNurse);

      if (!createdNurse) {
        throw new BadRequestException('Failed to create nurse');
      }

      return createdNurse.nurseId;
    });
  }

  async update(nurseId: string, updateNurseDto: UpdateNurseDto): Promise<void> {
    const nurse = await this.findById(nurseId);

    if (!nurse) {
      throw new NotFoundException(`Nurse with ID ${nurseId} not found`);
    }

    await this.nurseRepository.update(nurse.nurseId, updateNurseDto);
  }

  async deleteByUserId(userId: string): Promise<void> {
    const nurse = await this.findByUserId(userId);

    if (!nurse) {
      throw new NotFoundException(`Nurse with User ID ${userId} not found`);
    }

    await this.nurseRepository.remove(nurse);
  }

  async deleteByEmployeeId(employeeId: string): Promise<void> {
    const nurse = await this.findByEmployeeId(employeeId);

    if (!nurse) {
      throw new NotFoundException(
        `Nurse with Employee ID ${employeeId} not found`,
      );
    }

    await this.nurseRepository.remove(nurse);
  }

  async delete(nurseId: string): Promise<void> {
    const nurse = await this.findById(nurseId);

    if (!nurse) {
      throw new NotFoundException(`Nurse with ID ${nurseId} not found`);
    }

    await this.nurseRepository.remove(nurse);
  }
}
