import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { standardDateFormat } from '../../../common/functions/format-date';
import { UserGenderType } from '../../user/enums/user-gender.enum';
import { UserRelationship } from '../../user/enums/user-relationship.enum';

export class CreatePatientDto {
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
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: `dateOfBirth must be in ${standardDateFormat} format`,
  })
  dateOfBirth: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;
}
