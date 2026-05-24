import { FindOptionsSelect } from 'typeorm';
import { EMPLOYEE_BASE_SELECTION } from '../../employee/constants/employee.selection';
import { USER_BASE_SELECTION } from '../../user/constants/user.selection';
import { Doctor } from '../entities/doctor.entity';

const SCHEDULE_LIST_SELECTION: FindOptionsSelect<Doctor>['schedules'] = {
  doctorScheduleId: true,
  day: true,
};

export const DOCTOR_LIST_SELECTION: FindOptionsSelect<Doctor> = {
  doctorId: true,
  title: true,
  jobTitle: true,
  employee: { ...EMPLOYEE_BASE_SELECTION, user: USER_BASE_SELECTION },
  schedules: SCHEDULE_LIST_SELECTION,
};

export const DOCTOR_DETAIL_SELECTION: FindOptionsSelect<Doctor> = {
  doctorId: true,
  title: true,
  jobTitle: true,
  employee: {
    ...EMPLOYEE_BASE_SELECTION,
    user: { ...USER_BASE_SELECTION, dateOfBirth: true },
  },
  appointments: {
    appointmentId: true,
    endTime: true,
    status: true,
    patient: { patientId: true },
  },
};
