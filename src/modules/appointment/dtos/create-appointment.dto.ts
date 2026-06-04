import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, Matches } from 'class-validator';
import { format } from 'date-fns';

export class CreateAppointmentDto {
  @ApiProperty({
    example: 'Patient UUID',
  })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    example: 'Doctor UUID',
  })
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({
    example: 'Concern description',
  })
  @IsString()
  @IsNotEmpty()
  concern: string;

  @ApiProperty({
    example: format(new Date(), 'yyyy-MM-dd'),
    description: 'Appointment date (yyyy-MM-dd)',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    example: '09:00',
    description: 'Booked time slot in HH:mm (24h) format',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'timeSlot must be in HH:mm (24h) format',
  })
  timeSlot: string;
}
