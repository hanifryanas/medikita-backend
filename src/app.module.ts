import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from './common/guards/jwt.guard';
import { RequiredRoleGuard } from './common/guards/required-role.guard';
import {
  DatabaseEnv,
  buildPostgresOptions,
  databaseConfig,
  tokenConfig,
} from './config';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { AuthModule } from './modules/auth/auth.module';
import { DepartmentModule } from './modules/department/department.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { HomeModule } from './modules/home/home.module';
import { NurseModule } from './modules/nurse/nurse.module';
import { PatientModule } from './modules/patient/patient.module';
import { UserModule } from './modules/user/user.module';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RequiredRoleGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      inject: [Reflector],
      useFactory: (reflector: Reflector) =>
        new ClassSerializerInterceptor(
          reflector /*, { excludeExtraneousValues: true } */,
        ),
    },
  ],
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, tokenConfig],
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        buildPostgresOptions(
          configService.getOrThrow<DatabaseEnv>('database'),
          __dirname,
        ),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    PatientModule,
    DepartmentModule,
    EmployeeModule,
    DoctorModule,
    NurseModule,
    AppointmentModule,
    HomeModule,
  ],
})
export class AppModule {}
