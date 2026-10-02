/** Modèles TypeScript — Domaine PDL-145T */

// ─── Géographie ──────────────────────────────────────────────────────────────

export interface Province {
  id: string;
  name: string;
  code: string | null;
  created_at: string;
}

export interface Territory {
  id: string;
  name: string;
  code: string | null;
  province_id: string;
  created_at: string;
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

// ─── Centre de santé ─────────────────────────────────────────────────────────

export interface HealthCenter {
  id: string;
  name: string;
  code: string | null;
  territory_id: string;
  commune_sector_id: string | null;
  address: string | null;
  phone: string | null;
  director_name: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// ─── RBAC ────────────────────────────────────────────────────────────────────

export type RoleName =
  | 'AGENT_SANTE'
  | 'SAGE_FEMME'
  | 'SUPERVISEUR_ZONE'
  | 'ADMIN_PROVINCIAL'
  | 'ADMIN_NATIONAL'
  | 'AUDITEUR'
  | 'OFFICIER_ETAT_CIVIL';

export interface RolePermissions {
  births: {
    create: boolean;
    read: 'own_center' | 'territory' | 'province' | 'national' | false;
    validate: boolean;
    correct: boolean;
    cancel: boolean;
  };
  parents: {
    create: boolean;
    read: 'own_center' | 'territory' | 'province' | 'national' | false;
    update: boolean;
  };
  certificates: {
    generate: boolean;
    validate: boolean;
    download: boolean;
  };
  users: {
    create: boolean;
    read: boolean;
    update: boolean;
    deactivate: boolean;
  };
  audit: {
    read: 'own_center' | 'territory' | 'province' | 'national' | false;
  };
  sync: {
    push: boolean;
    resolveConflicts: boolean;
  };
}

export interface Role {
  id: string;
  name: RoleName;
  description: string | null;
  permissions: string; // JSON stringifié de RolePermissions
  created_at: string;
}

// ─── Utilisateurs ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  email: string | null;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  role_id: string;
  health_center_id: string | null;
  province_id: string | null;
  territory_id: string | null;
  is_active: number;
  failed_login_attempts: number;
  locked_until: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole extends User {
  role: Role;
}

export interface UserPublic {
  id: string;
  username: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role_id: string;
  role_name: RoleName;
  health_center_id: string | null;
  province_id: string | null;
  territory_id: string | null;
  is_active: boolean;
}

// ─── Parents ─────────────────────────────────────────────────────────────────

export type CivilStatus = 'marie' | 'celibataire' | 'divorce' | 'veuf';
export type SyncStatus = 'LOCAL' | 'PENDING' | 'SYNCED' | 'CONFLICT';

export interface Parent {
  id: string;
  nin: string | null; // ⚠️ Format NNI (9 chiffres) — À valider par l'autorité compétente
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
  created_by: string | null;
  updated_by: string | null;
  sync_status: SyncStatus;
  local_id: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Enfants ─────────────────────────────────────────────────────────────────

export type BirthType = 'SINGLE' | 'TWIN' | 'TRIPLET' | 'OTHER';

export interface Child {
  id: string;
  system_id: string | null; // ⚠️ Format provisoire — À valider par l'autorité compétente
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
  father_unknown: number;
  mother_unknown: number;
  father_unknown_reason: string | null;
  mother_unknown_reason: string | null;
  created_by: string | null;
  updated_by: string | null;
  sync_status: SyncStatus;
  local_id: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Naissances ───────────────────────────────────────────────────────────────

export type BirthStatus = 'DRAFT' | 'IN_PROGRESS' | 'VALIDATED' | 'CANCELLED';

export interface Birth {
  id: string;
  child_id: string;
  health_center_id: string;
  registered_by: string;
  status: BirthStatus;
  validated_by: string | null;
  validated_at: string | null;
  cancellation_reason: string | null;
  draft_data: string | null; // JSON du brouillon
  created_at: string;
  updated_at: string;
}

// ─── Examens cliniques ────────────────────────────────────────────────────────

export type BloodGroup = 'A' | 'B' | 'AB' | 'O' | 'UNKNOWN';
export type BloodRhesus = 'POS' | 'NEG' | 'UNKNOWN';
export type BloodStatus = 'DONE' | 'NOT_DONE' | 'UNKNOWN';

export interface ClinicalExamination {
  id: string;
  birth_id: string;
  // ⚠️ Apgar : seuils d'interprétation à valider par le Ministère de la Santé
  apgar_1min: number | null;
  apgar_5min: number | null;
  apgar_notes: string | null;
  physical_exam_done: number;
  physical_exam_datetime: string | null;
  physical_exam_professional: string | null;
  physical_exam_results: string | null;
  physical_exam_notes: string | null;
  blood_group: BloodGroup | null;
  blood_rhesus: BloodRhesus | null;
  blood_status: BloodStatus;
  // ⚠️ Oxymétrie : protocole à valider officiellement
  pulse_oximetry_done: number;
  pulse_oximetry_value: number | null;
  pulse_oximetry_notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ScreeningType = 'GUTHRIE' | 'AUDITORY' | 'BILIRUBIN' | 'OTHER';

export interface Screening {
  id: string;
  birth_id: string;
  type: ScreeningType;
  done: number;
  screening_datetime: string | null;
  method: string | null;
  result: string | null;
  value: number | null;
  unit: string | null;
  notes: string | null;
  professional: string | null;
  created_by: string | null;
  created_at: string;
}

// ─── Vaccins et soins ─────────────────────────────────────────────────────────

export type VaccineType = 'HEPATITIS_B' | 'BCG' | 'OTHER';

export interface Vaccine {
  id: string;
  birth_id: string;
  vaccine_type: VaccineType;
  administered: number;
  administered_at: string | null;
  professional: string | null;
  health_center_id: string | null;
  batch_number: string | null;
  notes: string | null;
  non_administration_reason: string | null;
  created_by: string | null;
  created_at: string;
}

/** ⚠️ VITAMIN_K et OPHTHALMIC_OINTMENT sont des SOINS PRÉVENTIFS, pas des vaccins */
export type CareType = 'VITAMIN_K' | 'OPHTHALMIC_OINTMENT' | 'OTHER';

export interface Care {
  id: string;
  birth_id: string;
  care_type: CareType;
  administered: number;
  administered_at: string | null;
  product: string | null;
  notes: string | null;
  non_administration_reason: string | null;
  created_by: string | null;
  created_at: string;
}

// ─── Actes de naissance ───────────────────────────────────────────────────────

export type CertificateStatus = 'DRAFT' | 'PENDING_VALIDATION' | 'CERTIFIED' | 'REJECTED' | 'CANCELLED';
/** ⚠️ legal_status : PRE_REGISTRATION n'a pas de valeur juridique */
export type LegalStatus = 'PRE_REGISTRATION' | 'SUBMITTED' | 'LEGALLY_VALIDATED';

export interface BirthCertificate {
  id: string;
  birth_id: string;
  certificate_number: string | null; // ⚠️ Format à valider
  pdf_path: string | null;
  pdf_hash: string | null;
  qr_code_data: string | null; // ⚠️ À valider par l'autorité compétente
  status: CertificateStatus;
  legal_status: LegalStatus;
  issued_by: string | null;
  issued_at: string | null;
  validated_by: string | null;
  validated_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Synchronisation ─────────────────────────────────────────────────────────

export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncQueueStatus = 'PENDING' | 'PROCESSING' | 'SYNCED' | 'FAILED' | 'CONFLICT';
export type SyncEntityType = 'parent' | 'child' | 'birth' | 'clinical_examination'
  | 'screening' | 'vaccine' | 'care' | 'birth_certificate';

export interface SynchronizationQueueItem {
  id: string;
  entity_type: SyncEntityType;
  entity_id: string;
  operation: SyncOperation;
  payload: string; // JSON
  status: SyncQueueStatus;
  retry_count: number;
  max_retries: number;
  error_message: string | null;
  conflict_data: string | null;
  created_by: string | null;
  created_at: string;
  processed_at: string | null;
  synced_at: string | null;
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  user_id: string | null;
  username: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  old_values: string | null; // JSON
  new_values: string | null; // JSON
  ip_address: string | null;
  user_agent: string | null;
  request_id: string | null;
  health_center_id: string | null;
  result: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  error_message: string | null;
  created_at: string;
}

// ─── DTOs (Data Transfer Objects) ────────────────────────────────────────────

export interface CreateParentDTO {
  nin?: string | null;
  first_names: string;
  last_name: string;
  post_names?: string | null;
  birth_date?: string | null;
  gender?: 'M' | 'F' | null;
  civil_status?: CivilStatus | null;
  email?: string | null;
  phone?: string | null;
  profession?: string | null;
  address_avenue?: string | null;
  address_number?: string | null;
  village_quarter_id?: string | null;
  commune_sector_id?: string | null;
  territory_id?: string | null;
  province_id?: string | null;
}

export interface UpdateParentDTO extends Partial<CreateParentDTO> {}

export interface CreateChildDTO {
  first_names: string;
  last_name: string;
  post_names?: string | null;
  birth_datetime: string;
  birth_place?: string | null;
  gender?: 'M' | 'F' | 'INDETERMINE' | null;
  birth_type?: BirthType;
  birth_order?: number;
  father_id?: string | null;
  mother_id?: string | null;
  father_unknown?: boolean;
  mother_unknown?: boolean;
  father_unknown_reason?: string | null;
  mother_unknown_reason?: string | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchParentsQuery extends PaginationParams {
  nin?: string;
  first_names?: string;
  last_name?: string;
  province_id?: string;
  territory_id?: string;
}
