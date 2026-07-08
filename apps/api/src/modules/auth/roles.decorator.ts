import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  ORGANIZATION_OWNER = 'ORGANIZATION_OWNER',
  SUPER_ADMINISTRATOR = 'SUPER_ADMINISTRATOR',
  ADMINISTRATOR = 'ADMINISTRATOR',
  DEPARTMENT_MANAGER = 'DEPARTMENT_MANAGER',
  TEAM_LEAD = 'TEAM_LEAD',
  EXECUTIVE_USER = 'EXECUTIVE_USER',
  MEMBER = 'MEMBER',
  AUDITOR = 'AUDITOR',
  VIEWER = 'VIEWER',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
