import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';
import { add, format } from 'date-fns';

export class UpdateAppointmentTimeDto {
  @ApiProperty({
    example: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
    description: 'New start time of the appointment in ISO 8601 format',
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({
    example: format(add(new Date(), { hours: 1 }), "yyyy-MM-dd'T'HH:mm:ssxxx"),
    description: 'New end time of the appointment in ISO 8601 format',
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endTime: Date;
}
