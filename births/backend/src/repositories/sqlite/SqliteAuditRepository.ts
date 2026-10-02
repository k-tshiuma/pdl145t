import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { AuditLog } from '../../models';
import { IAuditRepository, CreateAuditLogDTO } from '../interfaces/IAuditRepository';

export class SqliteAuditRepository implements IAuditRepository {
  constructor(private readonly db: Knex) {}

  /**
   * Crée une entrée d'audit. Cette table est IMMUABLE — INSERT uniquement.
   * Ne jamais appeler UPDATE ou DELETE sur audit_logs.
   */
  async create(data: CreateAuditLogDTO): Promise<AuditLog> {
    const id = uuidv4();
    const now = new Date().toISOString();
    await this.db('audit_logs').insert({
      id,
      user_id: data.user_id ?? null,
      username: data.username ?? null,
      action: data.action,
      entity_type: data.entity_type ?? null,
      entity_id: data.entity_id ?? null,
      old_values: data.old_values ? JSON.stringify(data.old_values) : null,
      new_values: data.new_values ? JSON.stringify(data.new_values) : null,
      ip_address: data.ip_address ?? null,
      user_agent: data.user_agent ?? null,
      request_id: data.request_id ?? null,
      health_center_id: data.health_center_id ?? null,
      result: data.result ?? 'SUCCESS',
      error_message: data.error_message ?? null,
      created_at: now,
    });
    return (await this.findById(id))!;
  }

  async findById(id: string): Promise<AuditLog | null> {
    return (await this.db('audit_logs').where({ id }).first()) ?? null;
  }

  async list(filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    healthCenterId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: AuditLog[]; total: number }> {
    const page = filters?.page ?? 1;
    const limit = Math.min(filters?.limit ?? 50, 200);
    const offset = (page - 1) * limit;

    let qb = this.db('audit_logs');
    if (filters?.userId) qb = qb.where('user_id', filters.userId);
    if (filters?.action) qb = qb.where('action', filters.action);
    if (filters?.entityType) qb = qb.where('entity_type', filters.entityType);
    if (filters?.entityId) qb = qb.where('entity_id', filters.entityId);
    if (filters?.healthCenterId) qb = qb.where('health_center_id', filters.healthCenterId);
    if (filters?.fromDate) qb = qb.where('created_at', '>=', filters.fromDate);
    if (filters?.toDate) qb = qb.where('created_at', '<=', filters.toDate);

    const [{ count }] = await qb.clone().count('* as count');
    const total = Number(count);
    const data = await qb.orderBy('created_at', 'desc').limit(limit).offset(offset);

    return { data, total };
  }
}
