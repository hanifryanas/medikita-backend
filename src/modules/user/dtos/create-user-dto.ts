import { faker } from '@faker-js/faker';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { User } from '../entities/user.entity';
import { UserGenderType } from '../enums/user-gender.enum';

const exampleGender = faker.helpers.arrayElement(
  Object.values(UserGenderType),
) as UserGenderType;
const exampleIdentityNumber = faker.string.numeric(16);
const exampleFirstName = faker.person.firstName(exampleGender);
const exampleLastName = faker.person.lastName(exampleGender);
const exampleUserName = `${exampleFirstName}${exampleLastName}`.toLowerCase();
const exampleEmail = `${exampleUserName}@mail.com`;
const examplePassword = faker.helpers
  .arrayElement(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'])
  .repeat(8);
const exampleDateOfBirth = faker.date.birthdate({
  min: 1959,
  max: 2006,
  mode: 'year',
});
const examplePhoneNumber = `62${faker.phone.number().replace(/\D/g, '').slice(0, 10)}`;
const exampleAddress = faker.location.streetAddress();

export class CreateUserDto implements Partial<User> {
  @ApiProperty({
    example: exampleIdentityNumber,
  })
  @IsString()
  @IsNotEmpty()
  identityNumber: string;

  @ApiProperty({
    example: exampleEmail,
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: exampleUserName,
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    example: exampleFirstName,
    description: 'First name',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: exampleLastName,
    description: 'Last name',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: examplePassword,
    description: 'Password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: exampleGender, enum: UserGenderType })
  @IsEnum(UserGenderType)
  @IsNotEmpty()
  gender: UserGenderType;

  @ApiProperty({
    example: exampleDateOfBirth,
    description: 'Date of birth',
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiPropertyOptional({
    example: examplePhoneNumber,
    description: 'Phone number',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiPropertyOptional({
    example: exampleAddress,
    description: 'Address',
  })
  @IsString()
  @IsOptional()
  address?: string;
}
