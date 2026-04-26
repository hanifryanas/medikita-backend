import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { add, format } from 'date-fns';

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
    example: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
    description: 'Start time of the appointment in ISO 8601 format',
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({
    example: format(add(new Date(), { hours: 1 }), "yyyy-MM-dd'T'HH:mm:ssxxx"),
    description: 'End time of the appointment in ISO 8601 format',
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endTime: Date;
}
