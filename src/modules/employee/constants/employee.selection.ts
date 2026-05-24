import { FindOptionsSelect } from 'typeorm';
import { Employee } from '../entities/employee.entity';

export const EMPLOYEE_BASE_SELECTION: FindOptionsSelect<Employee> = {
  employeeId: true,
  startDate: true,
  department: { departmentId: true, typeCode: true },
};
