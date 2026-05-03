import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { InsuranceProviderType } from '../enums/insurance-provider.enum';

export class CreatePatientInsuranceDto {
  @ApiProperty({
    enum: InsuranceProviderType,
    enumName: 'InsuranceProviderType',
    example: InsuranceProviderType.BPJS,
  })
  @IsEnum(InsuranceProviderType)
  @IsNotEmpty()
  insuranceProvider: InsuranceProviderType;

  @ApiProperty({ example: '3567011908010003' })
  @IsString()
  @IsNotEmpty()
  policyNumber: string;
}
