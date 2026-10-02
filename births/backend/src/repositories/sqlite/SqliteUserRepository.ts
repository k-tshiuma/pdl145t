import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { User, UserWithRole, UserPublic, RoleName } from '../../models';
import { IUserRepository, CreateUserDTO } from '../interfaces/IUserRepository';
import { NotFoundError } from '../../utils/errors';

export class SqliteUserRepository implements IUserRepository {
  constructor(private readonly db: Knex) {}

  async findById(id: string): Promise<User | null> {
    return (await this.db('users').where({ id }).first()) ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    return (await this.db('users').where({ username }).first()) ?? null;
  }

  async findWithRole(id: string): Promise<UserWithRole | null> {
    const row = await this.db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .select('users.*', 'roles.name as role_name', 'roles.permissions as role_permissions', 'roles.description as role_description')
      .where('users.id', id)
      .first();

    if (!row) return null;

    return {
      ...row,
      role: {
        id: row.role_id,
        name: row.role_name,
        description: row.role_description,
        permissions: row.role_permissions,
        created_at: '',
      },
    };
  }

  async create(data: CreateUserDTO): Promise<User> {
    const id = uuidv4();
    const now = new Date().toISOString();
    await this.db('users').insert({ id, ...data, created_at: now, updated_at: now });
    return (await this.findById(id))!;
  }

  async update(id: string, data: Partial<CreateUserDTO>): Promise<User> {
    if (!(await this.findById(id))) throw new NotFoundError('Utilisateur');
    await this.db('users').where({ id }).update({ ...data, updated_at: new Date().toISOString() });
    return (await this.findById(id))!;
  }

  async deactivate(id: string): Promise<void> {
    await this.db('users').where({ id }).update({ is_active: 0, updated_at: new Date().toISOString() });
  }

  async incrementFailedAttempts(id: string): Promise<number> {
    await this.db('users').where({ id }).increment('failed_login_attempts', 1);
    const user = await this.findById(id);
    return user?.failed_login_attempts ?? 0;
  }

  async resetFailedAttempts(id: string): Promise<void> {
    await this.db('users').where({ id }).update({ failed_login_attempts: 0, locked_until: null });
  }

  async lockAccount(id: string, until: Date): Promise<void> {
    await this.db('users').where({ id }).update({ locked_until: until.toISOString() });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.db('users').where({ id }).update({ last_login: new Date().toISOString() });
  }

  async list(filters?: { roleId?: string; isActive?: boolean; healthCenterId?: string }): Promise<UserPublic[]> {
    let qb = this.db('users').join('roles', 'users.role_id', 'roles.id')
      .select('users.id', 'users.username', 'users.email', 'users.first_name',
              'users.last_name', 'users.role_id', 'roles.name as role_name',
              'users.health_center_id', 'users.province_id', 'users.territory_id',
              'users.is_active');

    if (filters?.roleId) qb = qb.where('users.role_id', filters.roleId);
    if (filters?.isActive !== undefined) qb = qb.where('users.is_active', filters.isActive ? 1 : 0);
    if (filters?.healthCenterId) qb = qb.where('users.health_center_id', filters.healthCenterId);

    const rows = await qb.orderBy('users.last_name');
    return rows.map(r => ({ ...r, is_active: Boolean(r.is_active) }));
  }

  async findRoleByName(name: RoleName): Promise<{ id: string; name: string; permissions: string } | null> {
    return (await this.db('roles').where({ name }).first()) ?? null;
  }
}
