import { AuditLog } from '../../models';

export interface CreateAuditLogDTO {
  user_id?: string | null;
  username?: string | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  request_id?: string | null;
  health_center_id?: string | null;
  result?: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  error_message?: string | null;
}

export interface IAuditRepository {
  create(data: CreateAuditLogDTO): Promise<AuditLog>;
  findById(id: string): Promise<AuditLog | null>;
  list(filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    healthCenterId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: AuditLog[]; total: number }>;
}
