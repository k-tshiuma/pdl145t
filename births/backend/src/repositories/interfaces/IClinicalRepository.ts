import { ClinicalExamination, Screening, ScreeningType } from '../../models';

export interface CreateClinicalDTO {
  apgar_1min?: number | null;
  apgar_5min?: number | null;
  apgar_notes?: string | null;
  physical_exam_done?: boolean;
  physical_exam_datetime?: string | null;
  physical_exam_professional?: string | null;
  physical_exam_results?: string | null;
  physical_exam_notes?: string | null;
  blood_group?: string | null;
  blood_rhesus?: string | null;
  blood_status?: string;
  pulse_oximetry_done?: boolean;
  pulse_oximetry_value?: number | null;
  pulse_oximetry_notes?: string | null;
}

export interface CreateScreeningDTO {
  type: ScreeningType;
  done: boolean;
  screening_datetime?: string | null;
  method?: string | null;
  result?: string | null;
  value?: number | null;
  unit?: string | null;
  notes?: string | null;
  professional?: string | null;
}

export interface IClinicalRepository {
  findByBirthId(birthId: string): Promise<ClinicalExamination | null>;
  createOrUpdate(birthId: string, data: CreateClinicalDTO, userId: string): Promise<ClinicalExamination>;
  createScreening(birthId: string, data: CreateScreeningDTO, userId: string): Promise<Screening>;
  findScreeningsByBirthId(birthId: string): Promise<Screening[]>;
  updateScreening(screeningId: string, data: Partial<CreateScreeningDTO>): Promise<Screening>;
}
