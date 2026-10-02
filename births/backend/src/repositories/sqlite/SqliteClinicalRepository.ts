import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { ClinicalExamination, Screening } from '../../models';
import { IClinicalRepository, CreateClinicalDTO, CreateScreeningDTO } from '../interfaces/IClinicalRepository';

export class SqliteClinicalRepository implements IClinicalRepository {
  constructor(private readonly db: Knex) {}

  async findByBirthId(birthId: string): Promise<ClinicalExamination | null> {
    return (await this.db('clinical_examinations').where({ birth_id: birthId }).first()) ?? null;
  }

  async createOrUpdate(birthId: string, data: CreateClinicalDTO, userId: string): Promise<ClinicalExamination> {
    const existing = await this.findByBirthId(birthId);
    const now = new Date().toISOString();

    const payload = {
      apgar_1min: data.apgar_1min ?? null,
      apgar_5min: data.apgar_5min ?? null,
      apgar_notes: data.apgar_notes ?? null,
      physical_exam_done: data.physical_exam_done ? 1 : 0,
      physical_exam_datetime: data.physical_exam_datetime ?? null,
      physical_exam_professional: data.physical_exam_professional ?? null,
      physical_exam_results: data.physical_exam_results ?? null,
      physical_exam_notes: data.physical_exam_notes ?? null,
      blood_group: data.blood_group ?? null,
      blood_rhesus: data.blood_rhesus ?? null,
      blood_status: data.blood_status ?? 'NOT_DONE',
      pulse_oximetry_done: data.pulse_oximetry_done ? 1 : 0,
      pulse_oximetry_value: data.pulse_oximetry_value ?? null,
      pulse_oximetry_notes: data.pulse_oximetry_notes ?? null,
      updated_by: userId,
      updated_at: now,
    };

    if (existing) {
      await this.db('clinical_examinations').where({ birth_id: birthId }).update(payload);
    } else {
      await this.db('clinical_examinations').insert({
        id: uuidv4(),
        birth_id: birthId,
        ...payload,
        created_by: userId,
        created_at: now,
      });
    }

    return (await this.findByBirthId(birthId))!;
  }

  async createScreening(birthId: string, data: CreateScreeningDTO, userId: string): Promise<Screening> {
    const id = uuidv4();
    const now = new Date().toISOString();
    await this.db('screenings').insert({
      id,
      birth_id: birthId,
      type: data.type,
      done: data.done ? 1 : 0,
      screening_datetime: data.screening_datetime ?? null,
      method: data.method ?? null,
      result: data.result ?? null,
      value: data.value ?? null,
      unit: data.unit ?? null,
      notes: data.notes ?? null,
      professional: data.professional ?? null,
      created_by: userId,
      created_at: now,
    });
    return (await this.db('screenings').where({ id }).first())!;
  }

  async findScreeningsByBirthId(birthId: string): Promise<Screening[]> {
    return this.db('screenings').where({ birth_id: birthId }).orderBy('created_at', 'asc');
  }

  async updateScreening(screeningId: string, data: Partial<CreateScreeningDTO>): Promise<Screening> {
    await this.db('screenings').where({ id: screeningId }).update({
      ...data,
      done: data.done !== undefined ? (data.done ? 1 : 0) : undefined,
    });
    return (await this.db('screenings').where({ id: screeningId }).first())!;
  }
}
