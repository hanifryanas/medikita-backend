import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReorderPatientItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ minimum: 1, description: '1-based position in the list' })
  @IsInt()
  @Min(1)
  ordinal: number;
}

export class ReorderPatientsDto {
  @ApiProperty({ type: [ReorderPatientItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderPatientItemDto)
  items: ReorderPatientItemDto[];
}
