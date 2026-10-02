import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config';
import { logger } from '../utils/logger';
import { IBirthRepository } from '../repositories/interfaces/IBirthRepository';
import { IChildRepository } from '../repositories/interfaces/IChildRepository';
import { IParentRepository } from '../repositories/interfaces/IParentRepository';
import { ICertificateRepository } from '../repositories/interfaces/ICertificateRepository';
import { NotFoundError } from '../utils/errors';

/**
 * Service de génération des actes de naissance au format PDF.
 *
 * ⚠️ AVERTISSEMENT LÉGAL :
 * Le document PDF généré par ce service est un DOCUMENT DE PRÉ-ENREGISTREMENT.
 * Il ne constitue PAS un acte de naissance juridiquement valable au sens
 * de la Loi n°87-010 du 1er août 1987 portant Code de la famille (RDC).
 *
 * La valeur juridique, le format officiel et la procédure de certification
 * doivent être définis par les autorités de l'état civil compétentes.
 *
 * Éléments nécessitant validation officielle avant production :
 * - Format et numérotation de l'acte
 * - Inclusion du QR code (légalité à vérifier)
 * - Signature numérique (reconnaissance légale en RDC à vérifier)
 * - En-tête officiel et armoiries de la RDC
 */
export class PDFService {
  constructor(
    private readonly birthRepo: IBirthRepository,
    private readonly childRepo: IChildRepository,
    private readonly parentRepo: IParentRepository,
    private readonly certRepo: ICertificateRepository,
  ) {}

  /**
   * Génère le PDF de l'acte de naissance et le sauvegarde sur le disque.
   * Met à jour le certificat avec le chemin du PDF et son hash.
   *
   * @returns Le buffer du PDF généré.
   */
  async generateCertificatePDF(certificateId: string): Promise<Buffer> {
    const cert = await this.certRepo.findById(certificateId);
    if (!cert) throw new NotFoundError('Certificat');

    const birth = await this.birthRepo.findById(cert.birth_id);
    if (!birth) throw new NotFoundError('Dossier de naissance');

    const child = await this.childRepo.findById(birth.child_id);
    if (!child) throw new NotFoundError('Enfant');

    const father = child.father_id ? await this.parentRepo.findById(child.father_id) : null;
    const mother = child.mother_id ? await this.parentRepo.findById(child.mother_id) : null;

    // Créer le document PDF (A4)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 en points
    const { width, height } = page.getSize();

    // Polices
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Couleurs du design system
    const navyColor = rgb(0.047, 0.137, 0.251);    // #0C2340
    const azureColor = rgb(0.0, 0.467, 0.784);     // #0077C8
    const textColor = rgb(0.067, 0.110, 0.176);    // #111C2D
    const lightGray = rgb(0.906, 0.922, 1.0);      // #E7EEFF

    // ── En-tête ─────────────────────────────────────────────────────────
    // Bannière navale en-tête
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width,
      height: 120,
      color: navyColor,
    });

    page.drawText('RÉPUBLIQUE DÉMOCRATIQUE DU CONGO', {
      x: 40,
      y: height - 45,
      size: 13,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText('MINISTÈRE DE LA SANTÉ PUBLIQUE', {
      x: 40,
      y: height - 65,
      size: 11,
      font: fontRegular,
      color: rgb(0.8, 0.88, 1),
    });

    page.drawText('PROGRAMME PDL-145T', {
      x: 40,
      y: height - 85,
      size: 10,
      font: fontRegular,
      color: rgb(0.8, 0.88, 1),
    });

    // ── Titre du document ─────────────────────────────────────────────────
    const titleY = height - 160;
    page.drawText('ACTE DE NAISSANCE', {
      x: width / 2 - 110,
      y: titleY,
      size: 20,
      font: fontBold,
      color: navyColor,
    });

    page.drawText('- DOCUMENT DE PRÉ-ENREGISTREMENT -', {
      x: width / 2 - 130,
      y: titleY - 25,
      size: 10,
      font: fontRegular,
      color: rgb(0.7, 0.4, 0),
    });

    // (!) Mention légale prominente
    page.drawRectangle({
      x: 40,
      y: titleY - 65,
      width: width - 80,
      height: 30,
      color: rgb(1, 0.855, 0.412), // golden yellow clair
    });

    page.drawText(
      '(!) Ce document est un pré-enregistrement. Validation officielle par l\'officier d\'état civil requise.',
      {
        x: 50,
        y: titleY - 52,
        size: 8,
        font: fontBold,
        color: rgb(0.286, 0.235, 0),
      }
    );

    // ── Numéro de dossier ─────────────────────────────────────────────────
    const refY = titleY - 100;
    page.drawText(`N° de dossier : ${cert.certificate_number ?? 'En attente d\'attribution'}`, {
      x: 40,
      y: refY,
      size: 10,
      font: fontBold,
      color: navyColor,
    });

    page.drawText(`Date d'émission : ${new Date().toLocaleDateString('fr-FR')}`, {
      x: 350,
      y: refY,
      size: 10,
      font: fontRegular,
      color: textColor,
    });

    // ── Section : Identité de l'enfant ────────────────────────────────────
    let y = refY - 40;
    y = this.drawSection(page, fontBold, fontRegular, 'IDENTITÉ DE L\'ENFANT', y, width, navyColor, lightGray);

    const childFullName = [child.first_names, child.last_name, child.post_names].filter(Boolean).join(' ');
    y = this.drawField(page, fontBold, fontRegular, 'Nom complet', childFullName, y, textColor);
    y = this.drawField(page, fontBold, fontRegular, 'Identifiant système', `${child.system_id ?? 'Non attribué'} (!) Provisoire`, y, textColor);
    y = this.drawField(page, fontBold, fontRegular, 'Date et heure de naissance', this.formatDateTime(child.birth_datetime), y, textColor);
    y = this.drawField(page, fontBold, fontRegular, 'Lieu de naissance', child.birth_place ?? 'Non renseigné', y, textColor);
    y = this.drawField(page, fontBold, fontRegular, 'Sexe', child.gender === 'M' ? 'Masculin' : child.gender === 'F' ? 'Féminin' : 'Non déterminé', y, textColor);
    y = this.drawField(page, fontBold, fontRegular, 'Type de naissance', this.translateBirthType(child.birth_type), y, textColor);

    // ── Section : Père ────────────────────────────────────────────────────
    y -= 10;
    y = this.drawSection(page, fontBold, fontRegular, 'PÈRE', y, width, navyColor, lightGray);

    if (child.father_unknown) {
      y = this.drawField(page, fontBold, fontRegular, 'Statut', `Père inconnu - ${child.father_unknown_reason ?? 'Raison non précisée'} (!) À valider`, y, textColor);
    } else if (father) {
      const fatherName = [father.first_names, father.last_name, father.post_names].filter(Boolean).join(' ');
      y = this.drawField(page, fontBold, fontRegular, 'Nom complet', fatherName, y, textColor);
      y = this.drawField(page, fontBold, fontRegular, 'Numéro d\'Identité', father.nin ?? 'Non renseigné', y, textColor);
      y = this.drawField(page, fontBold, fontRegular, 'Date de naissance', father.birth_date ?? 'Non renseignée', y, textColor);
    } else {
      y = this.drawField(page, fontBold, fontRegular, 'Statut', 'Informations non disponibles', y, textColor);
    }

    // ── Section : Mère ────────────────────────────────────────────────────
    y -= 10;
    y = this.drawSection(page, fontBold, fontRegular, 'MÈRE', y, width, navyColor, lightGray);

    if (child.mother_unknown) {
      y = this.drawField(page, fontBold, fontRegular, 'Statut', `Mère inconnue - ${child.mother_unknown_reason ?? 'Raison non précisée'} (!) À valider`, y, textColor);
    } else if (mother) {
      const motherName = [mother.first_names, mother.last_name, mother.post_names].filter(Boolean).join(' ');
      y = this.drawField(page, fontBold, fontRegular, 'Nom complet', motherName, y, textColor);
      y = this.drawField(page, fontBold, fontRegular, 'Numéro d\'Identité', mother.nin ?? 'Non renseigné', y, textColor);
      y = this.drawField(page, fontBold, fontRegular, 'Date de naissance', mother.birth_date ?? 'Non renseignée', y, textColor);
    }

    // ── Section : Centre d'enregistrement ────────────────────────────────
    y -= 10;
    y = this.drawSection(page, fontBold, fontRegular, 'ENREGISTREMENT', y, width, navyColor, lightGray);
    y = this.drawField(page, fontBold, fontRegular, 'Centre de santé', birth.health_center_id, y, textColor);
    y = this.drawField(page, fontBold, fontRegular, 'Date d\'enregistrement', this.formatDateTime(birth.created_at), y, textColor);

    // ── Pied de page ──────────────────────────────────────────────────────
    page.drawLine({
      start: { x: 40, y: 80 },
      end: { x: width - 40, y: 80 },
      thickness: 1,
      color: navyColor,
    });

    page.drawText(
      'PDL-145T - Système d\'enregistrement des naissances - République Démocratique du Congo',
      { x: 40, y: 65, size: 7, font: fontRegular, color: rgb(0.5, 0.5, 0.5) }
    );

    page.drawText(
      '(!) Document de pré-enregistrement - Non valable comme acte d\'état civil sans validation officielle',
      { x: 40, y: 50, size: 7, font: fontBold, color: rgb(0.7, 0.3, 0) }
    );

    // ── Sauvegarder le PDF ────────────────────────────────────────────────
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    // Hash pour vérification d'intégrité
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Sauvegarder sur le disque
    if (!fs.existsSync(config.pdf.storagePath)) {
      fs.mkdirSync(config.pdf.storagePath, { recursive: true });
    }

    const filename = `cert_${certificateId}_${Date.now()}.pdf`;
    const filePath = path.join(config.pdf.storagePath, filename);
    fs.writeFileSync(filePath, buffer);

    // Mettre à jour le certificat avec le chemin et le hash
    const relativePath = path.relative(process.cwd(), filePath);
    await this.certRepo.updatePdfPath(certificateId, relativePath, hash);

    logger.info(`PDF généré : ${filename} (hash: ${hash.slice(0, 8)}...)`);
    return buffer;
  }

  // ── Helpers de rendu ──────────────────────────────────────────────────────

  private drawSection(
    page: any, fontBold: PDFFont, _fontReg: PDFFont,
    title: string, y: number, width: number,
    color: ReturnType<typeof rgb>, bgColor: ReturnType<typeof rgb>
  ): number {
    page.drawRectangle({ x: 40, y: y - 22, width: width - 80, height: 22, color: bgColor });
    page.drawText(title, { x: 48, y: y - 15, size: 10, font: fontBold, color });
    return y - 35;
  }

  private drawField(
    page: any, fontBold: PDFFont, fontReg: PDFFont,
    label: string, value: string, y: number,
    color: ReturnType<typeof rgb>
  ): number {
    page.drawText(`${label} :`, { x: 48, y, size: 9, font: fontBold, color });
    page.drawText(value, { x: 200, y, size: 9, font: fontReg, color });
    return y - 18;
  }

  private formatDateTime(dt: string): string {
    try {
      return new Date(dt).toLocaleString('fr-FR');
    } catch {
      return dt;
    }
  }

  private translateBirthType(type: string): string {
    const map: Record<string, string> = {
      SINGLE: 'Naissance unique',
      TWIN: 'Naissance gémellaire',
      TRIPLET: 'Naissance multiple (triplés)',
      OTHER: 'Autre',
    };
    return map[type] ?? type;
  }
}
