import { Request, Response, NextFunction } from 'express';
import { BirthService } from '../services/birth.service';
import { PDFService } from '../services/pdf.service';
import { ICertificateRepository } from '../repositories/interfaces/ICertificateRepository';
import { NotFoundError } from '../utils/errors';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const createDraftSchema = z.object({
  health_center_id: z.string().uuid('ID centre de santé invalide'),
});

const confirmSchema = z.object({
  child: z.object({
    first_names: z.string()
      .min(2, 'Prénom(s) requis')
      .regex(/^[A-Za-zÀ-ÿ\s-]+$/, 'Le prénom ne doit contenir que des lettres'),
    last_name: z.string()
      .min(2, 'Nom requis')
      .regex(/^[A-Za-zÀ-ÿ\s-]+$/, 'Le nom ne doit contenir que des lettres'),
    post_names: z.string()
      .regex(/^[A-Za-zÀ-ÿ\s-]+$/, 'Le post-nom ne doit contenir que des lettres')
      .optional().nullable().or(z.literal('')),
    birth_datetime: z.string(),
    birth_place: z.string().optional().nullable(),
    gender: z.enum(['M', 'F', 'INDETERMINE']).optional().nullable(),
    birth_type: z.enum(['SINGLE', 'TWIN', 'TRIPLET', 'OTHER']).optional(),
    birth_order: z.number().int().positive().optional(),
    father_id: z.string().uuid().optional().nullable(),
    mother_id: z.string().uuid().optional().nullable(),
    father_unknown: z.boolean().optional(),
    mother_unknown: z.boolean().optional(),
    father_unknown_reason: z.string().optional().nullable(),
    mother_unknown_reason: z.string().optional().nullable(),
  }),
  province_code: z.string().min(1, 'Code province requis'),
});

export class BirthsController {
  constructor(
    private readonly birthService: BirthService,
    private readonly pdfService: PDFService,
    private readonly certRepo: ICertificateRepository,
  ) {}

  createDraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { health_center_id } = createDraftSchema.parse(req.body);
      const birth = await this.birthService.createDraft(health_center_id, req.user!.userId);
      res.status(201).json({ success: true, data: birth });
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.birthService.list({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        healthCenterId: req.query.health_center_id as string,
        status: req.query.status as any,
        registeredBy: req.user?.roleName === 'AGENT_SANTE' ? req.user.userId : undefined,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const record = await this.birthService.getById(req.params.id);
      res.json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  };

  updateDraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const birth = await this.birthService.updateDraft(req.params.id, req.body, req.user!.userId);
      res.json({ success: true, data: birth });
    } catch (err) {
      next(err);
    }
  };

  confirm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { child, province_code } = confirmSchema.parse(req.body);

      // Règle des 24 heures pour la naissance
      const birthDate = new Date(child.birth_datetime);
      const now = new Date();
      const diffMs = now.getTime() - birthDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // Si la date de naissance est dans le futur de plus de quelques minutes (marge d'erreur horloge)
      if (diffHours < -1) {
        return res.status(400).json({
          success: false,
          error: { message: "La date et l'heure de naissance ne peuvent pas être dans le futur." }
        }) as any;
      }

      // Si la date de naissance est supérieure à 24h dans le passé
      if (diffHours > 24) {
        return res.status(400).json({
          success: false,
          error: { message: "La déclaration doit être effectuée dans les 24 heures suivant la naissance de l'enfant." }
        }) as any;
      }

      const capitalize = (str?: string | null) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : str;
      const formattedChild = {
        ...child,
        first_names: child.first_names ? child.first_names.split(' ').map(capitalize).join(' ') : child.first_names,
        last_name: capitalize(child.last_name) as string,
        post_names: child.post_names ? child.post_names.split(' ').map(capitalize).join(' ') : child.post_names,
      };

      const record = await this.birthService.confirmAndValidate(
        req.params.id,
        formattedChild,
        province_code,
        req.user!.userId
      );

      // Créer le certificat et générer le PDF
      const cert = await this.certRepo.create({
        birth_id: record.birth.id,
        issued_by: req.user!.userId,
      });

      // Génération PDF en arrière-plan
      this.pdfService.generateCertificatePDF(cert.id).catch(console.error);

      res.json({ success: true, data: { ...record, certificateId: cert.id } });
    } catch (err) {
      next(err);
    }
  };

  getCertificate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cert = await this.certRepo.findByBirthId(req.params.id);
      if (!cert) throw new NotFoundError('Certificat');
      res.json({ success: true, data: cert });
    } catch (err) {
      next(err);
    }
  };

  downloadCertificatePDF = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cert = await this.certRepo.findByBirthId(req.params.id);
      if (!cert) throw new NotFoundError('Certificat');

      if (cert.pdf_path && fs.existsSync(path.resolve(process.cwd(), cert.pdf_path))) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="acte_naissance_${req.params.id}.pdf"`);
        fs.createReadStream(path.resolve(process.cwd(), cert.pdf_path)).pipe(res);
      } else {
        // Regénérer si non trouvé
        const buffer = await this.pdfService.generateCertificatePDF(cert.id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="acte_naissance_${req.params.id}.pdf"`);
        res.send(buffer);
      }
    } catch (err) {
      next(err);
    }
  };
}
