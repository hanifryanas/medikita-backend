export enum UserRole {
  User = 'user',
  Staff = 'staff',
  CareTeam = 'careteam',
  Admin = 'admin',
  SuperAdmin = 'superadmin',
}

export const RoleHierarchy = {
  [UserRole.User]: 0,
  [UserRole.Staff]: 1,
  [UserRole.CareTeam]: 2,
  [UserRole.Admin]: 3,
  [UserRole.SuperAdmin]: 4,
};
