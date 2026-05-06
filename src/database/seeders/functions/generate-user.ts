import { fakerID_ID as faker } from '@faker-js/faker';
import { User } from '../../../modules/user/entities/user.entity';
import { UserGenderType } from '../../../modules/user/enums/user-gender.enum';
import { UserRole } from '../../../modules/user/enums/user-role.enum';
import { generateMadiunAddress } from './generate-address';

export interface GenerateUserOptions {
  role?: UserRole | UserRole[];
  index?: number;
  usernamePrefix?: string;
  maxUsernameLength?: number;
  includeAddress?: boolean;
  birthYearRange?: { min: number; max: number };
}

export function generateUser(options: GenerateUserOptions = {}): Partial<User> {
  const {
    role,
    index,
    usernamePrefix = '',
    maxUsernameLength = 25,
    includeAddress = false,
    birthYearRange = { min: 1970, max: 2000 },
  } = options;

  const gender = faker.person.sexType() as UserGenderType;
  const firstName = faker.person.firstName(gender);
  const lastName = faker.person.lastName(gender);

  const nameSlug = `${firstName}${lastName}`.toLowerCase().slice(0, 15);
  const indexSuffix =
    index !== undefined ? String(index + 1).padStart(2, '0') : '';
  const rawUsername = `${usernamePrefix}${nameSlug}${indexSuffix}`;
  const userName = rawUsername.slice(0, maxUsernameLength);

  const resolvedRole = Array.isArray(role)
    ? faker.helpers.arrayElement(role)
    : role;

  const user: Partial<User> = {
    identityNumber: faker.string.numeric(16),
    email: `${userName}@mail.com`,
    userName,
    password: userName,
    firstName,
    lastName,
    gender,
    phoneNumber: `628${faker.string.numeric(10)}`,
    dateOfBirth: faker.date.birthdate({
      min: birthYearRange.min,
      max: birthYearRange.max,
      mode: 'year',
    }),
  };

  if (resolvedRole) user.role = resolvedRole;
  if (includeAddress) user.address = generateMadiunAddress();

  return user;
}
