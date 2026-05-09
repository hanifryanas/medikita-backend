import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { Department } from '../entities/department.entity';
import { DepartmentService } from '../services/department.service';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Public()
  @Get()
  async findAll(): Promise<Department[]> {
    return await this.departmentService.findAll();
  }

  @Public()
  @Get('featured')
  async findFeatured(): Promise<Department[]> {
    return await this.departmentService.findFeatured();
  }
}
