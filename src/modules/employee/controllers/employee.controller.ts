import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator';
import { RequiredRole } from '../../../common/decorators/required-role.decorator';
import { UserRole } from '../../user/enums/user-role.enum';
import { CreateEmployeeDto } from '../dtos/create-employee.dto';
import { Employee } from '../entities/employee.entity';
import { EmployeeService } from '../services/employee.service';

@Controller('employees')
@ApiTags('Employee')
@ApiBearerAuth()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @RequiredRole(UserRole.Admin)
  @Get()
  async findAll(): Promise<Employee[]> {
    return this.employeeService.findAll();
  }

  @RequiredRole(UserRole.Staff)
  @Get('me')
  async findOne(@CurrentUserId() userId: string): Promise<Employee> {
    return this.employeeService.findOneByUserId(userId);
  }

  @RequiredRole(UserRole.Admin)
  @Get(':employeeId')
  async findOneById(
    @Param('employeeId') employeeId: string,
  ): Promise<Employee> {
    return this.employeeService.findOneBy('employeeId', employeeId);
  }

  @RequiredRole(UserRole.SuperAdmin)
  @Post()
  async create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<string> {
    return this.employeeService.createWithRoleAssignment(createEmployeeDto);
  }

  @RequiredRole(UserRole.Staff)
  @Delete('me')
  async deleteByUserId(@CurrentUserId() userId: string): Promise<void> {
    await this.employeeService.removeAndDemote(userId);
  }

  @RequiredRole(UserRole.Admin)
  @Delete(':employeeId')
  async delete(@Param('employeeId') employeeId: number): Promise<void> {
    await this.employeeService.delete(employeeId);
  }
}
