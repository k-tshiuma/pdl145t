import { User, UserWithRole, UserPublic, RoleName } from '../../models';

export interface CreateUserDTO {
  username: string;
  email?: string | null;
  password_hash: string;
  first_name?: string | null;
  last_name?: string | null;
  role_id: string;
  health_center_id?: string | null;
  province_id?: string | null;
  territory_id?: string | null;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findWithRole(id: string): Promise<UserWithRole | null>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: string, data: Partial<CreateUserDTO>): Promise<User>;
  deactivate(id: string): Promise<void>;
  incrementFailedAttempts(id: string): Promise<number>;
  resetFailedAttempts(id: string): Promise<void>;
  lockAccount(id: string, until: Date): Promise<void>;
  updateLastLogin(id: string): Promise<void>;
  list(filters?: { roleId?: string; isActive?: boolean; healthCenterId?: string }): Promise<UserPublic[]>;
  findRoleByName(name: RoleName): Promise<{ id: string; name: string; permissions: string } | null>;
}
