import { IBirthRepository } from '../repositories/interfaces/IBirthRepository';
import { IChildRepository } from '../repositories/interfaces/IChildRepository';
import { IAuditRepository } from '../repositories/interfaces/IAuditRepository';
import { ICertificateRepository } from '../repositories/interfaces/ICertificateRepository';
import { CreateChildDTO, Birth, BirthStatus, PaginatedResult, PaginationParams } from '../models';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { IdentifierService } from './identifier.service';

export interface FullBirthRecord {
  birth: Birth;
  child: Awaited<ReturnType<IChildRepository['findById']>>;
}

export class BirthService {
  constructor(
    private readonly birthRepo: IBirthRepository,
    private readonly childRepo: IChildRepository,
    private readonly certRepo: ICertificateRepository,
    private readonly auditRepo: IAuditRepository,
    private readonly identifierService: IdentifierService,
  ) {}

  /**
   * Crée un brouillon de dossier de naissance.
   */
  async createDraft(healthCenterId: string, userId: string): Promise<Birth> {
    // Créer un enfant vide temporaire
    const child = await this.childRepo.create({
      first_names: '',
      last_name: '',
      birth_datetime: new Date().toISOString(),
    }, userId);

    const birth = await this.birthRepo.create({
      child_id: child.id,
      health_center_id: healthCenterId,
      registered_by: userId,
    });

    await this.auditRepo.create({
      user_id: userId,
      action: 'CREATE_BIRTH_DRAFT',
      entity_type: 'birth',
      entity_id: birth.id,
      health_center_id: healthCenterId,
      result: 'SUCCESS',
    });

    return birth;
  }

  /**
   * Sauvegarde les données du brouillon (appelé à chaque étape du stepper).
   */
  async updateDraft(birthId: string, draftData: Record<string, unknown>, userId: string): Promise<Birth> {
    const birth = await this.birthRepo.findById(birthId);
    if (!birth) throw new NotFoundError('Dossier de naissance');

    if (birth.registered_by !== userId && !['ADMIN_NATIONAL', 'ADMIN_PROVINCIAL'].includes('')) {
      // TODO: vérification de scope complète via le service RBAC
    }

    return this.birthRepo.updateDraftData(birthId, draftData);
  }

  /**
   * Valide et enregistre définitivement un dossier de naissance.
   * Cette méthode applique toutes les validations métier.
   */
  async confirmAndValidate(
    birthId: string,
    childData: CreateChildDTO,
    provinceCode: string,
    userId: string
  ): Promise<FullBirthRecord> {
    const birth = await this.birthRepo.findById(birthId);
    if (!birth) throw new NotFoundError('Dossier de naissance');

    if (birth.status !== 'DRAFT' && birth.status !== 'IN_PROGRESS') {
      throw new ValidationError(`Le dossier ne peut pas être validé dans l'état : ${birth.status}`);
    }

    // Vérification doublon (même père + mère + date approximative)
    const duplicates = await this.childRepo.findPotentialDuplicates(
      childData.father_id,
      childData.mother_id,
      childData.birth_datetime
    );
    // Affine la vérification: ne bloque que si c'est EXACTEMENT le même enfant (même nom et prénom)
    const exactDuplicate = duplicates.find(
      (d) => d.id !== birth.child_id && 
             d.first_names?.toLowerCase() === childData.first_names?.toLowerCase() &&
             d.last_name?.toLowerCase() === childData.last_name?.toLowerCase()
    );

    if (exactDuplicate) {
      throw new ConflictError(
        'Un enfant avec les mêmes noms et prénoms est déjà enregistré pour ces parents à cette date',
        exactDuplicate.id
      );
    }

    // Mettre à jour les données de l'enfant
    await this.childRepo.update(birth.child_id, childData, userId);

    // ⚠️ Générer un identifiant provisoire — Format à valider par l'autorité compétente
    const systemId = await this.identifierService.generateTemporaryId(provinceCode);
    await this.childRepo.assignSystemId(birth.child_id, systemId);

    // Valider le dossier
    const validatedBirth = await this.birthRepo.updateStatus(birthId, 'VALIDATED', userId);
    const child = await this.childRepo.findById(birth.child_id);

    await this.auditRepo.create({
      user_id: userId,
      action: 'VALIDATE_BIRTH',
      entity_type: 'birth',
      entity_id: birthId,
      new_values: { status: 'VALIDATED', system_id: systemId },
      health_center_id: birth.health_center_id,
      result: 'SUCCESS',
    });

    return { birth: validatedBirth, child };
  }

  /**
   * Retourne un dossier par son ID.
   */
  async getById(birthId: string): Promise<FullBirthRecord> {
    const birth = await this.birthRepo.findById(birthId);
    if (!birth) throw new NotFoundError('Dossier de naissance');
    const child = await this.childRepo.findById(birth.child_id);
    return { birth, child };
  }

  /**
   * Liste les dossiers avec filtres et pagination.
   */
  async list(params: PaginationParams & {
    healthCenterId?: string;
    status?: BirthStatus;
    registeredBy?: string;
  }): Promise<PaginatedResult<Birth>> {
    return this.birthRepo.list(params);
  }
}
