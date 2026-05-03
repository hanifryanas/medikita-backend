import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../user/enums/user-role.enum';
import { UserService } from '../../user/services/user.service';
import { CreateEmployeeDto } from '../dtos/create-employee.dto';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly userService: UserService,
  ) {}

  async findAll(): Promise<Employee[]> {
    return await this.employeeRepository.find({ relations: { user: true } });
  }

  async findBy(partialEmployee: Partial<Employee>): Promise<Employee[]> {
    return await this.employeeRepository.findBy(partialEmployee);
  }

  async findOneByUserId(
    userId: string,
    selection?: (keyof Employee)[],
  ): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { user: { userId } },
      select: selection,
      relations: { user: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async findOneBy(
    employeeField: keyof Employee,
    employeeValue: Employee[keyof Employee],
    selection?: (keyof Employee)[],
  ): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { [employeeField]: employeeValue },
      select: selection,
      relations: { user: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async create(employee: Partial<Employee>): Promise<string> {
    const newEmployee = this.employeeRepository.create(employee);
    const createdEmployee = await this.employeeRepository.save(newEmployee);

    if (!createdEmployee) {
      throw new BadRequestException('Failed to create employee');
    }

    return createdEmployee.employeeId;
  }

  async createWithRoleAssignment(
    createEmployeeDto: CreateEmployeeDto,
  ): Promise<string> {
    const user = await this.userService.findOneBy({
      userId: createEmployeeDto.userId,
    });

    return await this.employeeRepository.manager.transaction(
      async (manager) => {
        const employeeRepository = manager.getRepository(Employee);
        const userRepository = manager.getRepository(User);

        const newEmployee = employeeRepository.create({
          ...createEmployeeDto,
          user,
        });
        const createdEmployee = await employeeRepository.save(newEmployee);

        if (!createdEmployee) {
          throw new BadRequestException('Failed to create employee');
        }

        const updateUserResult = await userRepository.update(user.userId, {
          role: createEmployeeDto.role,
        });

        if (!updateUserResult.affected) {
          throw new BadRequestException(
            `Failed to update user role for ID ${user.userId}`,
          );
        }

        return createdEmployee.employeeId;
      },
    );
  }

  async deleteByUserId(userId: string): Promise<void> {
    const result = await this.employeeRepository.delete({ user: { userId } });

    if (!result.affected) {
      throw new BadRequestException(
        `Failed to delete employee for user with ID ${userId}`,
      );
    }
  }

  async removeAndDemote(userId: string): Promise<void> {
    await this.employeeRepository.manager.transaction(async (manager) => {
      const employeeRepository = manager.getRepository(Employee);
      const userRepository = manager.getRepository(User);

      const deleteEmployeeResult = await employeeRepository.delete({
        user: { userId },
      });

      if (!deleteEmployeeResult.affected) {
        throw new BadRequestException(
          `Failed to delete employee for user with ID ${userId}`,
        );
      }

      const updateUserResult = await userRepository.update(userId, {
        role: UserRole.User,
      });

      if (!updateUserResult.affected) {
        throw new BadRequestException(
          `Failed to update user role for ID ${userId}`,
        );
      }
    });
  }

  async delete(employeeId: number): Promise<void> {
    const result = await this.employeeRepository.delete(employeeId);

    if (!result.affected) {
      throw new BadRequestException(
        `Failed to delete employee with ID ${employeeId}`,
      );
    }
  }
}
