import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { Vaccine, Care } from '../../models';
import { IVaccineRepository, CreateVaccineDTO, CreateCareDTO } from '../interfaces/IVaccineRepository';

export class SqliteVaccineRepository implements IVaccineRepository {
  constructor(private readonly db: Knex) {}

  async findByBirthId(birthId: string): Promise<Vaccine[]> {
    return this.db('vaccines').where({ birth_id: birthId }).orderBy('created_at');
  }

  async create(birthId: string, data: CreateVaccineDTO, userId: string): Promise<Vaccine> {
    const id = uuidv4();
    await this.db('vaccines').insert({
      id,
      birth_id: birthId,
      vaccine_type: data.vaccine_type,
      administered: data.administered ? 1 : 0,
      administered_at: data.administered_at ?? null,
      professional: data.professional ?? null,
      health_center_id: data.health_center_id ?? null,
      batch_number: data.batch_number ?? null,
      notes: data.notes ?? null,
      non_administration_reason: data.non_administration_reason ?? null,
      created_by: userId,
      created_at: new Date().toISOString(),
    });
    return (await this.db('vaccines').where({ id }).first())!;
  }

  async update(id: string, data: Partial<CreateVaccineDTO>): Promise<Vaccine> {
    await this.db('vaccines').where({ id }).update({
      ...data,
      administered: data.administered !== undefined ? (data.administered ? 1 : 0) : undefined,
    });
    return (await this.db('vaccines').where({ id }).first())!;
  }

  async findCareByBirthId(birthId: string): Promise<Care[]> {
    return this.db('care').where({ birth_id: birthId }).orderBy('created_at');
  }

  async createCare(birthId: string, data: CreateCareDTO, userId: string): Promise<Care> {
    const id = uuidv4();
    await this.db('care').insert({
      id,
      birth_id: birthId,
      care_type: data.care_type,
      administered: data.administered ? 1 : 0,
      administered_at: data.administered_at ?? null,
      product: data.product ?? null,
      notes: data.notes ?? null,
      non_administration_reason: data.non_administration_reason ?? null,
      created_by: userId,
      created_at: new Date().toISOString(),
    });
    return (await this.db('care').where({ id }).first())!;
  }

  async updateCare(id: string, data: Partial<CreateCareDTO>): Promise<Care> {
    await this.db('care').where({ id }).update({
      ...data,
      administered: data.administered !== undefined ? (data.administered ? 1 : 0) : undefined,
    });
    return (await this.db('care').where({ id }).first())!;
  }
}
