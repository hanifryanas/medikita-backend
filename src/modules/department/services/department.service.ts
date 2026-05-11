import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity';
import { Department } from '../entities/department.entity';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async findAll(): Promise<Department[]> {
    const departments = await this.departmentRepository.find({
      where: { isActive: true },
      relations: { employees: { doctor: true, nurse: true } },
      order: {
        displayName: 'asc',
        employees: { startDate: 'asc' },
      },
    });

    departments.forEach((dept) => {
      dept.employees = this.sortDepartmentEmployees(dept.employees);
    });

    return departments;
  }

  async findFeatured(): Promise<Department[]> {
    const departments = await this.departmentRepository.find({
      where: { isActive: true, featuredOrdinal: Not(IsNull()) },
      order: { featuredOrdinal: 'asc' },
    });

    const featuredEmployees = await this.employeeRepository.find({
      where: {
        featuredOrdinal: Not(IsNull()),
        department: { isActive: true, featuredOrdinal: Not(IsNull()) },
      },
      relations: { doctor: true, nurse: true, department: true },
      order: { featuredOrdinal: 'asc' },
    });

    const departmentEmployeeMap = new Map<number, Employee[]>();
    featuredEmployees.forEach((emp) => {
      const list = departmentEmployeeMap.get(emp.departmentId) ?? [];
      list.push(emp);
      departmentEmployeeMap.set(emp.departmentId, list);
    });

    departments.forEach((dept) => {
      dept.employees = departmentEmployeeMap.get(dept.departmentId) ?? [];
    });

    return departments;
  }

  async findOne(departmentId: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { departmentId },
      relations: { employees: { doctor: true, nurse: true } },
      order: { employees: { startDate: 'asc' } },
    });

    if (!department) {
      throw new NotFoundException(
        `Department with ID ${departmentId} not found`,
      );
    }

    department.employees = this.sortDepartmentEmployees(department.employees);

    return department;
  }

  private sortDepartmentEmployees(employees?: Employee[]): Employee[] {
    if (!employees) return [];
    return employees.sort((a, b) => {
      const roleOrder = (e: Employee) => (e.doctor ? 0 : e.nurse ? 1 : 2);
      const diff = roleOrder(a) - roleOrder(b);
      if (diff !== 0) return diff;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }
}
