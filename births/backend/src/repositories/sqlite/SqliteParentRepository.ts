import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import {
  Parent,
  CreateParentDTO,
  UpdateParentDTO,
  PaginatedResult,
  SearchParentsQuery,
  Child,
} from '../../models';
import { IParentRepository } from '../interfaces/IParentRepository';
import { NotFoundError } from '../../utils/errors';

export class SqliteParentRepository implements IParentRepository {
  constructor(private readonly db: Knex) {}

  async findByNIN(nin: string): Promise<Parent | null> {
    const row = await this.db('parents').where({ nin }).first();
    return row ?? null;
  }

  async findById(id: string): Promise<Parent | null> {
    const row = await this.db('parents').where({ id }).first();
    return row ?? null;
  }

  async search(query: SearchParentsQuery): Promise<PaginatedResult<Parent>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    let qb = this.db('parents');

    if (query.nin) {
      qb = qb.where('nin', 'like', `%${query.nin}%`);
    }
    if (query.last_name) {
      qb = qb.whereRaw('LOWER(last_name) LIKE ?', [`%${query.last_name.toLowerCase()}%`]);
    }
    if (query.first_names) {
      qb = qb.whereRaw('LOWER(first_names) LIKE ?', [`%${query.first_names.toLowerCase()}%`]);
    }
    if (query.province_id) {
      qb = qb.where('province_id', query.province_id);
    }
    if (query.territory_id) {
      qb = qb.where('territory_id', query.territory_id);
    }

    const [{ count }] = await qb.clone().count('* as count');
    const total = Number(count);

    const data = await qb
      .orderBy('last_name', 'asc')
      .orderBy('first_names', 'asc')
      .limit(limit)
      .offset(offset);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: CreateParentDTO, userId: string): Promise<Parent> {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.db('parents').insert({
      id,
      ...data,
      created_by: userId,
      sync_status: 'LOCAL',
      created_at: now,
      updated_at: now,
    });

    const created = await this.findById(id);
    if (!created) throw new Error('Échec de la création du parent');
    return created;
  }

  async update(id: string, data: UpdateParentDTO, userId: string): Promise<Parent> {
    const existing = await this.findById(id);
    if (!existing) throw new NotFoundError('Parent');

    await this.db('parents')
      .where({ id })
      .update({
        ...data,
        updated_by: userId,
        sync_status: existing.sync_status === 'SYNCED' ? 'PENDING' : existing.sync_status,
        updated_at: new Date().toISOString(),
      });

    return (await this.findById(id))!;
  }

  async findChildren(parentId: string): Promise<Child[]> {
    return this.db('children')
      .where('father_id', parentId)
      .orWhere('mother_id', parentId)
      .orderBy('birth_datetime', 'desc');
  }

  async findPotentialDuplicates(lastName: string, firstNames: string, birthDate?: string): Promise<Parent[]> {
    let qb = this.db('parents')
      .whereRaw('LOWER(last_name) = ?', [lastName.toLowerCase()])
      .whereRaw('LOWER(first_names) = ?', [firstNames.toLowerCase()]);

    if (birthDate) {
      qb = qb.where('birth_date', birthDate);
    }

    return qb;
  }

  async count(filters?: { healthCenterId?: string; provinceId?: string }): Promise<number> {
    let qb = this.db('parents');
    if (filters?.provinceId) qb = qb.where('province_id', filters.provinceId);
    const [{ count }] = await qb.count('* as count');
    return Number(count);
  }
}
