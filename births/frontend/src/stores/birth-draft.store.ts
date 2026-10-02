import { create } from 'zustand';
import type { BirthWorkflowStep, ParentFormData, Child } from '../types';

/**
 * Store du brouillon de naissance — données saisies étape par étape.
 * Persiste en mémoire uniquement (pas localStorage — données sensibles).
 */
interface BirthDraftState {
  // Dossier en cours
  birthId: string | null;
  currentStep: BirthWorkflowStep;
  stepIndex: number;

  // Données collectées par étape
  fatherId: string | null;
  motherId: string | null;
  fatherData: ParentFormData | null;
  motherData: ParentFormData | null;
  childData: Partial<Child> | null;
  clinicalData: Record<string, unknown> | null;
  vaccinesData: Record<string, unknown> | null;

  // État du père/mère inconnu
  fatherUnknown: boolean;
  motherUnknown: boolean;

  // Actions
  setBirthId: (id: string) => void;
  setStep: (step: BirthWorkflowStep, index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setFatherId: (id: string | null) => void;
  setMotherId: (id: string | null) => void;
  setFatherData: (data: ParentFormData) => void;
  setMotherData: (data: ParentFormData) => void;
  setFatherUnknown: (unknown: boolean) => void;
  setMotherUnknown: (unknown: boolean) => void;
  setChildData: (data: Partial<Child>) => void;
  setClinicalData: (data: Record<string, unknown>) => void;
  setVaccinesData: (data: Record<string, unknown>) => void;
  reset: () => void;
}

const STEPS: BirthWorkflowStep[] = [
  'search-parents',
  'father-info',
  'mother-info',
  'child-info',
  'clinical-exam',
  'vaccines-care',
  'summary',
  'certificate',
];

const initialState = {
  birthId: null,
  currentStep: 'search-parents' as BirthWorkflowStep,
  stepIndex: 0,
  fatherId: null,
  motherId: null,
  fatherData: null,
  motherData: null,
  childData: null,
  clinicalData: null,
  vaccinesData: null,
  fatherUnknown: false,
  motherUnknown: false,
};

export const useBirthDraftStore = create<BirthDraftState>()((set, get) => ({
  ...initialState,

  setBirthId: (id) => set({ birthId: id }),

  setStep: (step, index) => set({ currentStep: step, stepIndex: index }),

  nextStep: () => {
    const { stepIndex } = get();
    if (stepIndex < STEPS.length - 1) {
      const newIndex = stepIndex + 1;
      set({ currentStep: STEPS[newIndex], stepIndex: newIndex });
    }
  },

  prevStep: () => {
    const { stepIndex } = get();
    if (stepIndex > 0) {
      const newIndex = stepIndex - 1;
      set({ currentStep: STEPS[newIndex], stepIndex: newIndex });
    }
  },

  setFatherId: (id) => set({ fatherId: id }),
  setMotherId: (id) => set({ motherId: id }),
  setFatherData: (data) => set({ fatherData: data }),
  setMotherData: (data) => set({ motherData: data }),
  setFatherUnknown: (unknown) => set({ fatherUnknown: unknown }),
  setMotherUnknown: (unknown) => set({ motherUnknown: unknown }),
  setChildData: (data) => set({ childData: data }),
  setClinicalData: (data) => set({ clinicalData: data }),
  setVaccinesData: (data) => set({ vaccinesData: data }),
  reset: () => set(initialState),
}));
