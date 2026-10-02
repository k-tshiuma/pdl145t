import { getDatabase } from '../database/connection';

/**
 * Service de génération d'identifiants pour les enfants.
 *
 * ⚠️ AVERTISSEMENT IMPORTANT :
 * Le format d'identifiant implémenté ici est PROVISOIRE et à usage
 * de DÉVELOPPEMENT et TESTS uniquement.
 *
 * Le format officiel de l'identifiant national des enfants en RDC
 * DOIT être défini et validé par l'autorité compétente
 * (état civil, Ministère de l'Intérieur, ou organisme désigné)
 * avant toute mise en production.
 *
 * Si un système national d'identification existe déjà,
 * ce service devra être remplacé par une intégration avec ce système.
 *
 * Format provisoire actuel : PDL-{CODE_PROVINCE}-{ANNÉE}-{SÉQUENCE}
 * Exemple : PDL-KIN-2026-000001
 */
export class IdentifierService {
  /**
   * Génère un identifiant temporaire pour un enfant.
   *
   * ⚠️ Format provisoire — Ne pas utiliser en production sans validation officielle.
   *
   * @param provinceCode - Code de la province (ex: "KIN" pour Kinshasa)
   * @returns Identifiant temporaire au format PDL-{PROVINCE}-{ANNÉE}-{SEQ}
   */
  async generateTemporaryId(provinceCode: string): Promise<string> {
    const db = getDatabase();
    const year = new Date().getFullYear();
    const prefix = `PDL-${provinceCode.toUpperCase().slice(0, 3)}-${year}-`;

    // Recherche du dernier séquence pour ce préfixe
    const lastEntry = await db('children')
      .where('system_id', 'like', `${prefix}%`)
      .orderBy('system_id', 'desc')
      .first();

    let sequence = 1;
    if (lastEntry?.system_id) {
      const parts = lastEntry.system_id.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }
}
