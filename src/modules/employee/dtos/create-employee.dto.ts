import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import {
  formatDate,
  stardartDateFormat,
} from '../../../common/functions/format-date';
import { UserRole } from '../../user/enums/user-role.enum';

export class CreateEmployeeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: formatDate(new Date()),
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: `startDate must be in ${stardartDateFormat} format`,
  })
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    example: UserRole.Staff,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    example: 1,
    description: 'ID of an existing Department',
  })
  @IsInt()
  @Type(() => Number)
  departmentId: number;

  @ApiPropertyOptional({
    description: 'Photo URL',
  })
  @IsString()
  @IsOptional()
  photoUrl?: string;
}
