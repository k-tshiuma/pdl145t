import { Request, Response, NextFunction } from 'express';
import { ParentService } from '../services/parent.service';
import { z } from 'zod';

const searchSchema = z.object({
  nin: z.string().optional(),
  last_name: z.string().optional(),
  first_names: z.string().optional(),
  province_id: z.string().optional(),
  territory_id: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

const createParentSchema = z.object({
  nin: z.string().regex(/^\d{9}$/, 'NIN doit être composé de 9 chiffres').optional().nullable().or(z.literal('')),
  first_names: z.string().min(2, 'Prénom(s) requis'),
  last_name: z.string().min(2, 'Nom requis'),
  post_names: z.string().optional().nullable(),
  birth_date: z.string().optional().nullable(),
  gender: z.enum(['M', 'F']).optional().nullable(),
  civil_status: z.enum(['marie', 'celibataire', 'divorce', 'veuf']).optional().nullable(),
  email: z.string().email('Email invalide').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable().or(z.literal('')),
  profession: z.string().optional().nullable().or(z.literal('')),
  address_avenue: z.string().optional().nullable().or(z.literal('')),
  address_number: z.string().optional().nullable().or(z.literal('')),
  address_quarter_village: z.string().optional().nullable().or(z.literal('')),
  address_commune_sector: z.string().optional().nullable().or(z.literal('')),
  address_territory: z.string().optional().nullable().or(z.literal('')),
  address_city: z.string().optional().nullable().or(z.literal('')),
  address_province: z.string().optional().nullable().or(z.literal('')),
  village_quarter_id: z.string().uuid().optional().nullable(),
  commune_sector_id: z.string().uuid().optional().nullable(),
  territory_id: z.string().uuid().optional().nullable(),
  province_id: z.string().uuid().optional().nullable(),
});

export class ParentsController {
  constructor(private readonly parentService: ParentService) {}

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = searchSchema.parse(req.query);
      const result = await this.parentService.search(query);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parent = await this.parentService.getById(req.params.id);
      res.json({ success: true, data: parent });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createParentSchema.parse(req.body);
      const capitalize = (str?: string | null) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : str;
      const formattedData = {
        ...data,
        nin: data.nin === '' ? null : data.nin,
        first_names: data.first_names ? data.first_names.split(' ').map(capitalize).join(' ') : data.first_names,
        last_name: capitalize(data.last_name) as string,
        post_names: data.post_names ? data.post_names.split(' ').map(capitalize).join(' ') : data.post_names,
      };

      const parent = await this.parentService.create(formattedData, req.user!.userId);
      res.status(201).json({ success: true, data: parent });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createParentSchema.partial().parse(req.body);
      const formattedData = {
        ...data,
        nin: data.nin === '' ? null : data.nin,
      };
      const parent = await this.parentService.update(req.params.id, formattedData, req.user!.userId);
      res.json({ success: true, data: parent });
    } catch (err) {
      next(err);
    }
  };

  checkDuplicate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.parentService.checkDuplicate(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getChildren = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const children = await this.parentService.getChildren(req.params.id);
      res.json({ success: true, data: children });
    } catch (err) {
      next(err);
    }
  };
}
