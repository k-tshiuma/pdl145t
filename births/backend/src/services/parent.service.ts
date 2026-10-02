import { IParentRepository } from '../repositories/interfaces/IParentRepository';
import { IAuditRepository } from '../repositories/interfaces/IAuditRepository';
import { CreateParentDTO, UpdateParentDTO, Parent, PaginatedResult, SearchParentsQuery } from '../models';
import { ConflictError, NotFoundError } from '../utils/errors';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingParent?: Parent;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reason?: string;
}

export class ParentService {
  constructor(
    private readonly parentRepo: IParentRepository,
    private readonly auditRepo: IAuditRepository,
  ) {}

  /**
   * Recherche un parent par NIN.
   */
  async findByNIN(nin: string): Promise<Parent | null> {
    return this.parentRepo.findByNIN(nin);
  }

  /**
   * Recherche paginée de parents.
   */
  async search(query: SearchParentsQuery): Promise<PaginatedResult<Parent>> {
    return this.parentRepo.search(query);
  }

  /**
   * Récupère un parent par son ID interne.
   */
  async getById(id: string): Promise<Parent> {
    const parent = await this.parentRepo.findById(id);
    if (!parent) throw new NotFoundError('Parent');
    return parent;
  }

  /**
   * Crée un nouveau parent ou retourne le parent existant s'il y a un doublon.
   */
  async create(data: CreateParentDTO, userId: string): Promise<Parent> {
    // Vérification doublon par NIN
    if (data.nin) {
      const existing = await this.parentRepo.findByNIN(data.nin);
      if (existing) {
        return existing; // Retourne le parent existant pour permettre l'enregistrement de l'enfant
      }
    }

    // Vérification doublon par nom + prénom
    const duplicates = await this.parentRepo.findPotentialDuplicates(
      data.last_name,
      data.first_names,
      data.birth_date ?? undefined
    );

    if (duplicates.length > 0) {
      // On avertit mais on n'empêche pas (peut être homonyme)
      // L'agent devra confirmer explicitement
      // Pour l'instant, on laisse passer pour permettre la création de doublons partiels
    }

    const parent = await this.parentRepo.create(data, userId);

    await this.auditRepo.create({
      user_id: userId,
      action: 'CREATE_PARENT',
      entity_type: 'parent',
      entity_id: parent.id,
      new_values: { nin: parent.nin, last_name: parent.last_name, first_names: parent.first_names },
      result: 'SUCCESS',
    });

    return parent;
  }

  /**
   * Met à jour les données d'un parent.
   */
  async update(id: string, data: UpdateParentDTO, userId: string): Promise<Parent> {
    const existing = await this.parentRepo.findById(id);
    if (!existing) throw new NotFoundError('Parent');

    const updated = await this.parentRepo.update(id, data, userId);

    await this.auditRepo.create({
      user_id: userId,
      action: 'UPDATE_PARENT',
      entity_type: 'parent',
      entity_id: id,
      old_values: { nin: existing.nin, last_name: existing.last_name },
      new_values: { nin: updated.nin, last_name: updated.last_name },
      result: 'SUCCESS',
    });

    return updated;
  }

  /**
   * Vérifie les doublons potentiels pour un parent avant création.
   */
  async checkDuplicate(data: {
    nin?: string | null;
    last_name: string;
    first_names: string;
    birth_date?: string | null;
  }): Promise<DuplicateCheckResult> {
    // Vérification par NIN (certitude haute)
    if (data.nin) {
      const byNIN = await this.parentRepo.findByNIN(data.nin);
      if (byNIN) {
        return {
          isDuplicate: true,
          existingParent: byNIN,
          confidence: 'HIGH',
          reason: 'NIN identique',
        };
      }
    }

    // Vérification par nom + prénom + date
    const byName = await this.parentRepo.findPotentialDuplicates(
      data.last_name,
      data.first_names,
      data.birth_date ?? undefined
    );

    if (byName.length > 0) {
      return {
        isDuplicate: true,
        existingParent: byName[0],
        confidence: data.birth_date ? 'HIGH' : 'MEDIUM',
        reason: data.birth_date ? 'Nom, prénom et date de naissance identiques' : 'Nom et prénom identiques',
      };
    }

    return { isDuplicate: false, confidence: 'LOW' };
  }

  /**
   * Retourne les enfants d'un parent.
   */
  async getChildren(parentId: string) {
    await this.getById(parentId); // Vérifie existence
    return this.parentRepo.findChildren(parentId);
  }
}
