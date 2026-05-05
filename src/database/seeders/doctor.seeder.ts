import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { Day } from '../../common/enums/day.enum';
import { Department } from '../../modules/department/entities/department.entity';
import { DoctorSchedule } from '../../modules/doctor/entities/doctor-schedule.entity';
import { Doctor } from '../../modules/doctor/entities/doctor.entity';
import { Employee } from '../../modules/employee/entities/employee.entity';
import { User } from '../../modules/user/entities/user.entity';
import { UserGenderType } from '../../modules/user/enums/user-gender.enum';
import { UserRole } from '../../modules/user/enums/user-role.enum';

/** Maps a department typeCode to the Indonesian specialist title (Sp.XX)
 *  and plain-language job title for doctors assigned to that department. */
const DOCTOR_TITLE_BY_DEPARTMENT: Record<
  string,
  { title: string; jobTitle: string }
> = {
  cardiology: { title: 'Sp.JP', jobTitle: 'Cardiologist' },
  dermatology: { title: 'Sp.KK', jobTitle: 'Dermatologist' },
  pediatrics: { title: 'Sp.A', jobTitle: 'Pediatrician' },
  neurology: { title: 'Sp.S', jobTitle: 'Neurologist' },
  orthopedics: { title: 'Sp.OT', jobTitle: 'Orthopedic Surgeon' },
  obgyn: { title: 'Sp.OG', jobTitle: 'Obstetrician-Gynecologist' },
  oncology: { title: 'Sp.Onk', jobTitle: 'Oncologist' },
  otolaryngology: { title: 'Sp.THT-KL', jobTitle: 'ENT Specialist' },
  ophthalmology: { title: 'Sp.M', jobTitle: 'Ophthalmologist' },
  urology: { title: 'Sp.U', jobTitle: 'Urologist' },
  internist: { title: 'Sp.PD', jobTitle: 'Internist' },
  psychiatry: { title: 'Sp.KJ', jobTitle: 'Psychiatrist' },
  physiatry: { title: 'Sp.KFR', jobTitle: 'Physiatrist' },
  pulmonology: { title: 'Sp.P', jobTitle: 'Pulmonologist' },
  endocrinology: { title: 'Sp.PD-KEMD', jobTitle: 'Endocrinologist' },
};

@Injectable()
export class DoctorSeeder implements Seeder {
  private generatedDoctorUsers: Partial<User>[] = Array.from(
    { length: 50 },
    () => {
      const gender = faker.person.sexType() as UserGenderType;
      const firstName = faker.person.firstName(gender);
      const lastName = faker.person.lastName(gender);
      const usernameBase = `${firstName}${lastName}`.toLowerCase().slice(0, 15);
      return {
        identityNumber: faker.string.numeric(16),
        email: `${usernameBase}@mail.com`,
        userName: usernameBase,
        password: usernameBase,
        firstName: firstName,
        lastName: lastName,
        gender,
        role: faker.helpers.arrayElement([UserRole.Staff, UserRole.Admin]),
        phoneNumber: `628${faker.string.numeric(10)}`,
        dateOfBirth: faker.date.birthdate({
          min: 1970,
          max: 2000,
          mode: 'year',
        }),
      };
    },
  );

  private generatedDoctorEmployeeMap: Map<string, Partial<Employee>> = new Map(
    this.generatedDoctorUsers.map((user) => [
      user.userName,
      {
        startDate: faker.date.past({ years: 5 }),
      },
    ]),
  );

  private generatedDoctorScheduleMap: Map<string, Partial<DoctorSchedule>[]> =
    new Map(
      this.generatedDoctorUsers.map((user) => {
        const schedules: Partial<DoctorSchedule>[] = [];
        const numberOfSchedules = faker.number.int({ min: 3, max: 6 });
        const days = faker.helpers.arrayElements(
          Object.values(Day),
          numberOfSchedules,
        );
        days.forEach((day) => {
          const startHour = faker.number.int({ min: 8, max: 14 });
          const endHour = startHour + faker.number.int({ min: 2, max: 4 });
          schedules.push({
            day,
            startTime: `${startHour}:00`,
            endTime: `${endHour}:00`,
          });
        });

        return [user.userName, schedules];
      }),
    );

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(DoctorSchedule)
    private readonly doctorScheduleRepository: Repository<DoctorSchedule>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async seed() {
    const existingDoctorCount = await this.doctorRepository.count();
    const hasExistingDoctors = existingDoctorCount > 0;
    if (hasExistingDoctors) return;

    const doctorDepartments = await this.departmentRepository.findBy({
      isClinic: true,
      isActive: true,
    });

    const createdDoctorUsers = await Promise.all(
      this.generatedDoctorUsers.map(
        async (user) => await this.userRepository.save(user),
      ),
    );

    const createdEmployees = await Promise.all(
      createdDoctorUsers.map(async (user) => {
        const employeeData = this.generatedDoctorEmployeeMap.get(user.userName);
        const department = faker.helpers.arrayElement(doctorDepartments);
        const employee = this.employeeRepository.create({
          ...employeeData,
          user,
          departmentId: department.departmentId,
        });
        return await this.employeeRepository.save(employee);
      }),
    );

    const createdDoctors = await Promise.all(
      createdEmployees.map(async (employee) => {
        const department = doctorDepartments.find(
          (dept) => dept.departmentId === employee.departmentId,
        );
        const titles = department
          ? DOCTOR_TITLE_BY_DEPARTMENT[department.typeCode]
          : undefined;
        const doctor = this.doctorRepository.create({
          employee,
          title: titles?.title,
          jobTitle: titles?.jobTitle,
        });
        return await this.doctorRepository.save(doctor);
      }),
    );

    const doctorSchedules: Partial<DoctorSchedule>[] = [];
    createdDoctors.forEach((doctor) => {
      const schedules = this.generatedDoctorScheduleMap.get(
        doctor.employee.user.userName,
      );
      schedules?.forEach((schedule) => {
        doctorSchedules.push({
          ...schedule,
          doctor,
        });
      });
    });

    await Promise.all(
      doctorSchedules.map(
        async (schedule) =>
          await this.doctorScheduleRepository.save(
            this.doctorScheduleRepository.create(schedule),
          ),
      ),
    );
  }

  async drop() {
    await this.userRepository.delete(this.generatedDoctorUsers);
  }
}
