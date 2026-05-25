import { FindOptionsSelect } from 'typeorm';
import { EMPLOYEE_BASE_SELECTION } from '../../employee/constants/employee.selection';
import { USER_BASE_SELECTION } from '../../user/constants/user.selection';
import { Nurse } from '../entities/nurse.entity';

const SCHEDULE_LIST_SELECTION: FindOptionsSelect<Nurse>['schedules'] = {
  nurseScheduleId: true,
  day: true,
};

const SCHEDULE_DETAIL_SELECTION: FindOptionsSelect<Nurse>['schedules'] = {
  nurseScheduleId: true,
  day: true,
  startTime: true,
  endTime: true,
};

export const NURSE_LIST_SELECTION: FindOptionsSelect<Nurse> = {
  nurseId: true,
  title: true,
  employee: { ...EMPLOYEE_BASE_SELECTION, user: USER_BASE_SELECTION },
  schedules: SCHEDULE_LIST_SELECTION,
};

export const NURSE_DETAIL_SELECTION: FindOptionsSelect<Nurse> = {
  nurseId: true,
  title: true,
  employee: {
    ...EMPLOYEE_BASE_SELECTION,
    user: { ...USER_BASE_SELECTION, dateOfBirth: true },
  },
  schedules: SCHEDULE_DETAIL_SELECTION,
};
