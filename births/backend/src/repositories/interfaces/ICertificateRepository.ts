import { BirthCertificate, CertificateStatus, LegalStatus } from '../../models';

export interface CreateCertificateDTO {
  birth_id: string;
  issued_by: string;
}

export interface ICertificateRepository {
  findByBirthId(birthId: string): Promise<BirthCertificate | null>;
  findById(id: string): Promise<BirthCertificate | null>;
  create(data: CreateCertificateDTO): Promise<BirthCertificate>;
  updatePdfPath(id: string, pdfPath: string, pdfHash: string): Promise<BirthCertificate>;
  updateStatus(id: string, status: CertificateStatus): Promise<BirthCertificate>;
  updateLegalStatus(id: string, legalStatus: LegalStatus, validatedBy?: string): Promise<BirthCertificate>;
  updateCertificateNumber(id: string, number: string): Promise<BirthCertificate>;
}
