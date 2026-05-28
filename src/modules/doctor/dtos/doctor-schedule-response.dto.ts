import { Day } from '../../../common/enums/day.enum';

export class DoctorScheduleResponseDto {
  doctorScheduleId: number;
  day: Day;
  doctor: { doctorId: string };
  date?: string;
  timeSlots: string[];
  bookedTimeSlots: string[];
}
