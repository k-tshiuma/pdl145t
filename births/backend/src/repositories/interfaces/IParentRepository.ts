import {
  Parent,
  CreateParentDTO,
  UpdateParentDTO,
  PaginatedResult,
  SearchParentsQuery,
  Child,
} from '../../models';

/**
 * Interface abstraite pour l'accès aux données des parents.
 *
 * Toute implémentation concrète (SQLite, API gouvernementale, etc.)
 * doit respecter ce contrat. Les services ne dépendent que de cette interface.
 */
export interface IParentRepository {
  /**
   * Recherche un parent par son Numéro d'Identification Nationale.
   * @returns null si aucun parent trouvé avec ce NIN.
   */
  findByNIN(nin: string): Promise<Parent | null>;

  /** Recherche un parent par son ID interne. */
  findById(id: string): Promise<Parent | null>;

  /**
   * Recherche paginée avec filtres multiples.
   */
  search(query: SearchParentsQuery): Promise<PaginatedResult<Parent>>;

  /** Crée un nouveau parent. */
  create(data: CreateParentDTO, userId: string): Promise<Parent>;

  /** Met à jour un parent existant. */
  update(id: string, data: UpdateParentDTO, userId: string): Promise<Parent>;

  /** Retourne les enfants associés à un parent (en tant que père ou mère). */
  findChildren(parentId: string): Promise<Child[]>;

  /**
   * Vérifie si un parent similaire existe déjà (détection de doublons).
   * Basé sur nom + prénom + date de naissance.
   */
  findPotentialDuplicates(lastName: string, firstNames: string, birthDate?: string): Promise<Parent[]>;

  /** Retourne le nombre total de parents enregistrés (avec filtre optionnel). */
  count(filters?: { healthCenterId?: string; provinceId?: string }): Promise<number>;
}
