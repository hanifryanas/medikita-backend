import { UserRole } from '../../user/enums/user-role.enum';

export class SigninDataDto {
  userId: string;
  username: string;
  role: UserRole;
  accessToken?: string;
  refreshToken?: string;
}
