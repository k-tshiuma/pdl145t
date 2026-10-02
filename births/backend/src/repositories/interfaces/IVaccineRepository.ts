import { Vaccine, Care, VaccineType, CareType } from '../../models';

export interface CreateVaccineDTO {
  vaccine_type: VaccineType;
  administered: boolean;
  administered_at?: string | null;
  professional?: string | null;
  health_center_id?: string | null;
  batch_number?: string | null;
  notes?: string | null;
  non_administration_reason?: string | null;
}

export interface CreateCareDTO {
  care_type: CareType;
  administered: boolean;
  administered_at?: string | null;
  product?: string | null;
  notes?: string | null;
  non_administration_reason?: string | null;
}

export interface IVaccineRepository {
  findByBirthId(birthId: string): Promise<Vaccine[]>;
  create(birthId: string, data: CreateVaccineDTO, userId: string): Promise<Vaccine>;
  update(id: string, data: Partial<CreateVaccineDTO>): Promise<Vaccine>;
  findCareByBirthId(birthId: string): Promise<Care[]>;
  createCare(birthId: string, data: CreateCareDTO, userId: string): Promise<Care>;
  updateCare(id: string, data: Partial<CreateCareDTO>): Promise<Care>;
}
