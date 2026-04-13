import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@mail.com',
  })
  @IsString()
  @IsNotEmpty()
  emailOrUsername: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isRemember?: boolean;
}
