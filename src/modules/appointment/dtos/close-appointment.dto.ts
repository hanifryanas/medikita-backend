import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { add, format } from 'date-fns';
import { Status } from '../../../common/enums/status.enum';

export class CloseAppointmentDto {
  @ApiProperty({
    example: Status.Completed,
    enum: Status,
  })
  @IsEnum(Status)
  @IsNotEmpty()
  status: Status;

  @ApiPropertyOptional({
    example: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
    description:
      'Actual consultation start time recorded by the doctor (ISO 8601)',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startTime?: Date;

  @ApiPropertyOptional({
    example: format(
      add(new Date(), { minutes: 20 }),
      "yyyy-MM-dd'T'HH:mm:ssxxx",
    ),
    description:
      'Actual consultation end time recorded by the doctor (ISO 8601)',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endTime?: Date;

  @ApiPropertyOptional({ example: 'Diagnosis details' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ example: 'Notes details' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'OB314' })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiPropertyOptional({
    description: 'List of nurse IDs attending the appointment',
    isArray: true,
    type: String,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  nurseIds?: string[];
}
