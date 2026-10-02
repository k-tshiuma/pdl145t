import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { useBirthDraftStore } from '../../stores/birth-draft.store';
import { StepperNav } from '../../components/layout/StepperNav';
import { NavDock } from '../../components/layout/NavDock';
import { api } from '../../services/api';

// Steps
import { SearchParentsStep } from './steps/SearchParentsStep';
import { ParentFormStep } from './steps/ParentFormStep';
import { ChildInfoStep } from './steps/ChildInfoStep';
import { ClinicalExamStep } from './steps/ClinicalExamStep';
import { VaccinesCareStep } from './steps/VaccinesCareStep';
import { SummaryStep } from './steps/SummaryStep';
import { CertificateStep } from './steps/CertificateStep';

/**
 * Page orchestratrice du workflow d'enregistrement d'une naissance.
 * 8 étapes séquentielles avec sauvegarde progressive du brouillon.
 */
export function BirthWorkflowPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const store = useBirthDraftStore();
  const [loading, setLoading] = useState(false);

  // Créer un brouillon au chargement si aucun n'existe
  useEffect(() => {
    if (!store.birthId && user?.healthCenterId) {
      setLoading(true);
      api.post('/births/draft', { health_center_id: user.healthCenterId })
        .then((res) => {
          store.setBirthId(res.data.data.id);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrev = () => {
    if (store.stepIndex === 0) {
      navigate('/');
    } else {
      store.prevStep();
    }
  };

  const handleNext = () => {
    store.nextStep();
  };

  // Rendu de l'étape courante
  const renderStep = () => {
    switch (store.currentStep) {
      case 'search-parents':
        return <SearchParentsStep onNext={handleNext} />;
      case 'father-info':
        return <ParentFormStep key="father" parentType="father" onNext={handleNext} />;
      case 'mother-info':
        return <ParentFormStep key="mother" parentType="mother" onNext={handleNext} />;
      case 'child-info':
        return <ChildInfoStep onNext={handleNext} />;
      case 'clinical-exam':
        return <ClinicalExamStep onNext={handleNext} />;
      case 'vaccines-care':
        return <VaccinesCareStep onNext={handleNext} />;
      case 'summary':
        return <SummaryStep />;
      case 'certificate':
        return <CertificateStep />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-body-md text-on-surface-variant">Création du brouillon...</p>
      </div>
    );
  }

  const isLastStep = store.currentStep === 'certificate';
  const isSummary = store.currentStep === 'summary';
  const hasForm = ['father-info', 'mother-info', 'child-info', 'clinical-exam', 'vaccines-care', 'summary'].includes(store.currentStep);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <StepperNav stepIndex={store.stepIndex} />

      <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full">
        {renderStep()}
        <div className="h-32 w-full flex-shrink-0" />
      </div>

      {!isLastStep && (
        <NavDock
          onPrev={handlePrev}
          onNext={hasForm ? undefined : handleNext}
          formId={hasForm ? 'step-form' : undefined}
          prevLabel={store.stepIndex === 0 ? 'Annuler' : 'Précédent'}
          nextLabel={isSummary ? "Valider l'enregistrement" : "Suivant"}
          prevDisabled={false}
          nextLoading={false} // Would be nice to link this to the store but let's keep it simple
        />
      )}
    </div>
  );
}
