import { Birth, BirthStatus, PaginatedResult, PaginationParams } from '../../models';

export interface CreateBirthDTO {
  child_id: string;
  health_center_id: string;
  registered_by: string;
}

export interface IBirthRepository {
  findById(id: string): Promise<Birth | null>;
  findByChildId(childId: string): Promise<Birth | null>;
  create(data: CreateBirthDTO): Promise<Birth>;
  updateStatus(id: string, status: BirthStatus, userId?: string): Promise<Birth>;
  updateDraftData(id: string, draftData: Record<string, unknown>): Promise<Birth>;
  list(params: PaginationParams & {
    healthCenterId?: string;
    status?: BirthStatus;
    registeredBy?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<PaginatedResult<Birth>>;
  countByHealthCenter(healthCenterId: string, date?: string): Promise<number>;
}
