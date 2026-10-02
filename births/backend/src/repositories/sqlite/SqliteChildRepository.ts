import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { Child, CreateChildDTO, PaginatedResult, PaginationParams } from '../../models';
import { IChildRepository } from '../interfaces/IChildRepository';
import { NotFoundError } from '../../utils/errors';

export class SqliteChildRepository implements IChildRepository {
  constructor(private readonly db: Knex) {}

  async findById(id: string): Promise<Child | null> {
    return (await this.db('children').where({ id }).first()) ?? null;
  }

  async findBySystemId(systemId: string): Promise<Child | null> {
    return (await this.db('children').where({ system_id: systemId }).first()) ?? null;
  }

  async findByParents(fatherId?: string, motherId?: string): Promise<Child[]> {
    let qb = this.db('children');
    if (fatherId) qb = qb.where('father_id', fatherId);
    if (motherId) qb = qb.orWhere('mother_id', motherId);
    return qb.orderBy('birth_datetime', 'desc');
  }

  async create(data: CreateChildDTO, userId: string): Promise<Child> {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.db('children').insert({
      id,
      first_names: data.first_names,
      last_name: data.last_name,
      post_names: data.post_names ?? null,
      birth_datetime: data.birth_datetime,
      birth_place: data.birth_place ?? null,
      gender: data.gender ?? null,
      birth_type: data.birth_type ?? 'SINGLE',
      birth_order: data.birth_order ?? 1,
      father_id: data.father_id ?? null,
      mother_id: data.mother_id ?? null,
      father_unknown: data.father_unknown ? 1 : 0,
      mother_unknown: data.mother_unknown ? 1 : 0,
      father_unknown_reason: data.father_unknown_reason ?? null,
      mother_unknown_reason: data.mother_unknown_reason ?? null,
      created_by: userId,
      sync_status: 'LOCAL',
      created_at: now,
      updated_at: now,
    });

    return (await this.findById(id))!;
  }

  async update(id: string, data: Partial<CreateChildDTO>, userId: string): Promise<Child> {
    if (!(await this.findById(id))) throw new NotFoundError('Enfant');
    await this.db('children').where({ id }).update({
      ...data,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    });
    return (await this.findById(id))!;
  }

  async assignSystemId(childId: string, systemId: string): Promise<Child> {
    await this.db('children')
      .where({ id: childId })
      .update({ system_id: systemId, updated_at: new Date().toISOString() });
    return (await this.findById(childId))!;
  }

  async list(params: PaginationParams & { healthCenterId?: string }): Promise<PaginatedResult<Child>> {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    let qb = this.db('children');
    if (params.healthCenterId) {
      qb = qb.whereIn('id', this.db('births').select('child_id').where('health_center_id', params.healthCenterId));
    }

    const [{ count }] = await qb.clone().count('* as count');
    const total = Number(count);
    const data = await qb.orderBy('birth_datetime', 'desc').limit(limit).offset(offset);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findPotentialDuplicates(fatherId?: string | null, motherId?: string | null, birthDatetime?: string): Promise<Child[]> {
    let qb = this.db('children');
    const conditions: string[] = [];

    if (fatherId) qb = qb.where('father_id', fatherId);
    if (motherId) qb = qb.orWhere('mother_id', motherId);
    if (birthDatetime) {
      const date = birthDatetime.split('T')[0];
      qb = qb.whereRaw("DATE(birth_datetime) = ?", [date]);
    }

    return qb;
  }
}
