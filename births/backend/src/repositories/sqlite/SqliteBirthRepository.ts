import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { Birth, BirthStatus, PaginatedResult, PaginationParams } from '../../models';
import { IBirthRepository, CreateBirthDTO } from '../interfaces/IBirthRepository';
import { NotFoundError } from '../../utils/errors';

export class SqliteBirthRepository implements IBirthRepository {
  constructor(private readonly db: Knex) {}

  async findById(id: string): Promise<Birth | null> {
    return (await this.db('births').where({ id }).first()) ?? null;
  }

  async findByChildId(childId: string): Promise<Birth | null> {
    return (await this.db('births').where({ child_id: childId }).first()) ?? null;
  }

  async create(data: CreateBirthDTO): Promise<Birth> {
    const id = uuidv4();
    const now = new Date().toISOString();
    await this.db('births').insert({
      id,
      ...data,
      status: 'DRAFT',
      created_at: now,
      updated_at: now,
    });
    return (await this.findById(id))!;
  }

  async updateStatus(id: string, status: BirthStatus, userId?: string): Promise<Birth> {
    const existing = await this.findById(id);
    if (!existing) throw new NotFoundError('Naissance');
    await this.db('births').where({ id }).update({
      status,
      ...(status === 'VALIDATED' && userId ? { validated_by: userId, validated_at: new Date().toISOString() } : {}),
      updated_at: new Date().toISOString(),
    });
    return (await this.findById(id))!;
  }

  async updateDraftData(id: string, draftData: Record<string, unknown>): Promise<Birth> {
    await this.db('births').where({ id }).update({
      draft_data: JSON.stringify(draftData),
      status: 'IN_PROGRESS',
      updated_at: new Date().toISOString(),
    });
    return (await this.findById(id))!;
  }

  async list(params: PaginationParams & {
    healthCenterId?: string;
    status?: BirthStatus;
    registeredBy?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<PaginatedResult<Birth>> {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    let qb = this.db('births');
    if (params.healthCenterId) qb = qb.where('health_center_id', params.healthCenterId);
    if (params.status) qb = qb.where('status', params.status);
    if (params.registeredBy) qb = qb.where('registered_by', params.registeredBy);
    if (params.fromDate) qb = qb.where('created_at', '>=', params.fromDate);
    if (params.toDate) qb = qb.where('created_at', '<=', params.toDate);

    const [{ count }] = await qb.clone().count('* as count');
    const total = Number(count);
    const data = await qb.orderBy('created_at', 'desc').limit(limit).offset(offset);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async countByHealthCenter(healthCenterId: string, date?: string): Promise<number> {
    let qb = this.db('births').where('health_center_id', healthCenterId);
    if (date) qb = qb.whereRaw("DATE(created_at) = ?", [date]);
    const [{ count }] = await qb.count('* as count');
    return Number(count);
  }
}
