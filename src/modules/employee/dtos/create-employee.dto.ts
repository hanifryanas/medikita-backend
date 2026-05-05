import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { formatDate } from 'date-fns';
import { UserRole } from '../../user/enums/user-role.enum';

export class CreateEmployeeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: formatDate(new Date(), 'yyyy-MM-dd'),
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date;

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
}
