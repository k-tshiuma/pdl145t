/** Types partagés frontend — miroir des modèles backend */

// ─── Géographie ──────────────────────────────────────────────────────────────
export interface Province {
  id: string;
  name: string;
  code: string | null;
}

export interface Territory {
  id: string;
  name: string;
  code: string | null;
  province_id: string;
}

export interface CommuneSector {
  id: string;
  name: string;
  type: 'commune' | 'secteur' | 'ville';
  territory_id: string;
}

export interface VillageQuarter {
  id: string;
  name: string;
  commune_sector_id: string;
}

export interface HealthCenter {
  id: string;
  name: string;
  code: string | null;
  territory_id: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export type RoleName =
  | 'AGENT_SANTE'
  | 'SAGE_FEMME'
  | 'SUPERVISEUR_ZONE'
  | 'ADMIN_PROVINCIAL'
  | 'ADMIN_NATIONAL'
  | 'AUDITEUR'
  | 'OFFICIER_ETAT_CIVIL';

export interface AuthUser {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roleName: RoleName;
  healthCenterId: string | null;
  provinceId: string | null;
  territoryId: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// ─── Parents ─────────────────────────────────────────────────────────────────
export type CivilStatus = 'marie' | 'celibataire' | 'divorce' | 'veuf';
export type SyncStatus = 'LOCAL' | 'PENDING' | 'SYNCED' | 'CONFLICT';

export interface Parent {
  id: string;
  nin: string | null;
  first_names: string;
  last_name: string;
  post_names: string | null;
  birth_date: string | null;
  gender: 'M' | 'F' | null;
  civil_status: CivilStatus | null;
  email: string | null;
  phone: string | null;
  profession: string | null;
  address_avenue: string | null;
  address_number: string | null;
  village_quarter_id: string | null;
  commune_sector_id: string | null;
  territory_id: string | null;
  province_id: string | null;
  sync_status: SyncStatus;
  created_at: string;
}

export interface ParentFormData {
  nin?: string;
  first_names: string;
  last_name: string;
  post_names?: string;
  birth_date?: string;
  gender?: 'M' | 'F';
  civil_status?: CivilStatus;
  email?: string;
  phone?: string;
  profession?: string;
  address_avenue?: string;
  address_number?: string;
  address_quarter_village?: string;
  address_commune_sector?: string;
  address_territory?: string;
  address_city?: string;
  address_province?: string;
  village_quarter_id?: string;
  commune_sector_id?: string;
  territory_id?: string;
  province_id?: string;
}

// ─── Enfants ─────────────────────────────────────────────────────────────────
export type BirthType = 'SINGLE' | 'TWIN' | 'TRIPLET' | 'OTHER';

export interface Child {
  id: string;
  system_id: string | null;
  nin?: string | null;
  first_names: string;
  last_name: string;
  post_names: string | null;
  birth_datetime: string;
  birth_place: string | null;
  gender: 'M' | 'F' | 'INDETERMINE' | null;
  birth_type: BirthType;
  birth_order: number;
  father_id: string | null;
  mother_id: string | null;
  father_unknown: boolean;
  mother_unknown: boolean;
}

// ─── Naissances ──────────────────────────────────────────────────────────────
export type BirthStatus = 'DRAFT' | 'IN_PROGRESS' | 'VALIDATED' | 'CANCELLED';

export interface Birth {
  id: string;
  child_id: string;
  health_center_id: string;
  registered_by: string;
  status: BirthStatus;
  draft_data: string | null;
  created_at: string;
  updated_at: string;
}

// ─── API Response ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// ─── Workflow Steps ──────────────────────────────────────────────────────────
export type BirthWorkflowStep =
  | 'search-parents'
  | 'father-info'
  | 'mother-info'
  | 'child-info'
  | 'clinical-exam'
  | 'vaccines-care'
  | 'summary'
  | 'certificate';

export const WORKFLOW_STEPS: { key: BirthWorkflowStep; label: string }[] = [
  { key: 'search-parents', label: 'Recherche parents' },
  { key: 'father-info', label: 'Père' },
  { key: 'mother-info', label: 'Mère' },
  { key: 'child-info', label: 'Enfant' },
  { key: 'clinical-exam', label: 'Examen clinique' },
  { key: 'vaccines-care', label: 'Vaccins & Soins' },
  { key: 'summary', label: 'Récapitulatif' },
  { key: 'certificate', label: 'Acte de naissance' },
];
