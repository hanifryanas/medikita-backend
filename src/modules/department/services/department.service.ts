import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async findAll(): Promise<Department[]> {
    return await this.departmentRepository.find({
      where: { isActive: true },
      order: { displayName: 'ASC' },
    });
  }

  async findFeatured(): Promise<Department[]> {
    return await this.departmentRepository.find({
      where: { isActive: true, isFeatured: true },
      order: { displayName: 'ASC' },
    });
  }

  async findOne(departmentId: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { departmentId },
    });

    if (!department) {
      throw new NotFoundException(
        `Department with ID ${departmentId} not found`,
      );
    }

    return department;
  }
}
