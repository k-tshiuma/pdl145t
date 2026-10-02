import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { BirthCertificate, CertificateStatus, LegalStatus } from '../../models';
import { ICertificateRepository, CreateCertificateDTO } from '../interfaces/ICertificateRepository';

export class SqliteCertificateRepository implements ICertificateRepository {
  constructor(private readonly db: Knex) {}

  async findByBirthId(birthId: string): Promise<BirthCertificate | null> {
    return (await this.db('birth_certificates').where({ birth_id: birthId }).first()) ?? null;
  }

  async findById(id: string): Promise<BirthCertificate | null> {
    return (await this.db('birth_certificates').where({ id }).first()) ?? null;
  }

  async create(data: CreateCertificateDTO): Promise<BirthCertificate> {
    const id = uuidv4();
    const now = new Date().toISOString();
    await this.db('birth_certificates').insert({
      id,
      birth_id: data.birth_id,
      issued_by: data.issued_by,
      issued_at: now,
      status: 'DRAFT',
      legal_status: 'PRE_REGISTRATION',
      created_at: now,
      updated_at: now,
    });
    return (await this.findById(id))!;
  }

  async updatePdfPath(id: string, pdfPath: string, pdfHash: string): Promise<BirthCertificate> {
    await this.db('birth_certificates').where({ id }).update({
      pdf_path: pdfPath,
      pdf_hash: pdfHash,
      status: 'PENDING_VALIDATION',
      updated_at: new Date().toISOString(),
    });
    return (await this.findById(id))!;
  }

  async updateStatus(id: string, status: CertificateStatus): Promise<BirthCertificate> {
    await this.db('birth_certificates').where({ id }).update({ status, updated_at: new Date().toISOString() });
    return (await this.findById(id))!;
  }

  async updateLegalStatus(id: string, legalStatus: LegalStatus, validatedBy?: string): Promise<BirthCertificate> {
    await this.db('birth_certificates').where({ id }).update({
      legal_status: legalStatus,
      ...(validatedBy ? { validated_by: validatedBy, validated_at: new Date().toISOString() } : {}),
      updated_at: new Date().toISOString(),
    });
    return (await this.findById(id))!;
  }

  async updateCertificateNumber(id: string, number: string): Promise<BirthCertificate> {
    await this.db('birth_certificates').where({ id }).update({
      certificate_number: number,
      updated_at: new Date().toISOString(),
    });
    return (await this.findById(id))!;
  }
}
