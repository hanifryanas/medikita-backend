import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserGenderType } from '../../user/enums/user-gender.enum';
import { UserRelationship } from '../../user/enums/user-relationship.enum';

export class CreatePatientDto {
  @ApiProperty({ description: 'User to link this patient profile to' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    enum: UserRelationship,
    enumName: 'UserRelationship',
    description: 'Relationship of the user to this patient profile',
    example: UserRelationship.Self,
  })
  @IsEnum(UserRelationship)
  relationship: UserRelationship;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  identityNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    enum: UserGenderType,
    enumName: 'UserGenderType',
    example: UserGenderType.Male,
  })
  @IsEnum(UserGenderType)
  gender: UserGenderType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ type: String, format: 'date' })
  @Type(() => Date)
  @IsDate()
  dateOfBirth: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;
}
