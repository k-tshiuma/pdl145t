import {
  Child,
  CreateChildDTO,
  PaginatedResult,
  PaginationParams,
} from '../../models';

export interface IChildRepository {
  findById(id: string): Promise<Child | null>;
  findBySystemId(systemId: string): Promise<Child | null>;
  findByParents(fatherId?: string, motherId?: string): Promise<Child[]>;
  create(data: CreateChildDTO, userId: string): Promise<Child>;
  update(id: string, data: Partial<CreateChildDTO>, userId: string): Promise<Child>;
  assignSystemId(childId: string, systemId: string): Promise<Child>;
  list(params: PaginationParams & { healthCenterId?: string }): Promise<PaginatedResult<Child>>;
  findPotentialDuplicates(fatherId?: string | null, motherId?: string | null, birthDatetime?: string): Promise<Child[]>;
}
