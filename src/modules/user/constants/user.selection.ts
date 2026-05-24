import { FindOptionsSelect } from 'typeorm';
import { User } from '../entities/user.entity';

export const USER_BASE_SELECTION: FindOptionsSelect<User> = {
  userId: true,
  firstName: true,
  lastName: true,
};
