import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '../department/entities/department.entity';
import { Doctor } from '../doctor/entities/doctor.entity';
import { HomeController } from './controllers/home.controller';
import { HomeService } from './services/home.service';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, Department])],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
