import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Calendar,
  Activity,
  Clock,
  Heart,
  Move,
  Stethoscope,
  Scale,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Footprints,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface ToolDef {
  id: string;
  category: 'mother' | 'baby';
  label: string;
  description: string;
  icon: any;
  gradient: string;
}

const ALL_TOOLS: ToolDef[] = [
  // Mother Tools
  {
    id: 'pregnancy-calc',
    category: 'mother',
    label: 'Calculateur de grossesse',
    description: 'Calcul de la date présumée d\'accouchement (DPA) et de l\'âge gestationnel',
    icon: Calculator,
    gradient: 'bg-gradient-pink-red',
  },
  {
    id: 'conception-calc',
    category: 'mother',
    label: 'Date de conception',
    description: 'Estimation de la date de fécondation basée sur les dernières règles',
    icon: Calendar,
    gradient: 'bg-gradient-teal',
  },
  {
    id: 'ovulation-calc',
    category: 'mother',
    label: 'Calendrier d\'ovulation',
    description: 'Période de fertilité et suivi du cycle menstruel',
    icon: Activity,
    gradient: 'bg-gradient-orange',
  },
  {
    id: 'pregnancy-trimester',
    category: 'mother',
    label: 'Trimestre de grossesse',
    description: 'Repères des trimestres et étapes clés du développement',
    icon: Clock,
    gradient: 'bg-gradient-plum',
  },
  {
    id: 'pregnancy-age',
    category: 'mother',
    label: 'Âge gestationnel (SA)',
    description: 'Nombre de semaines d\'aménorrhée et calendrier des consultations prénatales',
    icon: Calendar,
    gradient: 'bg-gradient-primary',
  },
  {
    id: 'symptoms-tracker',
    category: 'mother',
    label: 'Signes d\'alerte & symptômes',
    description: 'Dépistage des signes de danger (pré-éclampsie, hémorragies, fièvres)',
    icon: Stethoscope,
    gradient: 'bg-gradient-teal',
  },
  {
    id: 'contraction-timer',
    category: 'mother',
    label: 'Chronomètre de contractions',
    description: 'Mesure de la fréquence et durée des contractions pour le début du travail',
    icon: Clock,
    gradient: 'bg-gradient-orange',
  },
  {
    id: 'bmi',
    category: 'mother',
    label: 'IMC & Poids maternel',
    description: 'Suivi de la courbe de prise de poids gestationnelle recommandée',
    icon: Scale,
    gradient: 'bg-gradient-blue',
  },

  // Baby Assessment
  {
    id: 'kick-counter',
    category: 'baby',
    label: 'Compteur de mouvements (Kick Counter)',
    description: 'Protocole de Cardiff : comptage des 10 mouvements fœtaux pour évaluer la vitalité',
    icon: Move,
    gradient: 'bg-gradient-blue',
  },
  {
    id: 'first-move',
    category: 'baby',
    label: 'Premiers mouvements fœtaux',
    description: 'Enregistrement de la date de perception des premiers mouvements (quickening)',
    icon: Activity,
    gradient: 'bg-gradient-purple',
  },
  {
    id: 'first-heartbeat',
    category: 'baby',
    label: 'Bruits du cœur fœtal (BCF)',
    description: 'Normes de fréquence cardiaque fœtale (110 - 160 bpm) au stéthoscope ou Doppler',
    icon: Heart,
    gradient: 'bg-gradient-crimson',
  },
];

export function ToolsPage() {
  const [activeTab, setActiveTab] = useState<'mother' | 'baby'>('baby');
  const [selectedToolId, setSelectedToolId] = useState<string | null>('kick-counter');

  const filteredTools = ALL_TOOLS.filter((t) => t.category === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 font-sans w-full flex flex-col p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-congo-azure"></span>
            <h1 className="text-xl md:text-2xl font-bold text-sovereign-navy">
              Outils Cliniques & Périnatals (PDL-145T)
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
            Aide à la décision clinique et suivi pour les sages-femmes et agents de santé des 145 territoires : 
            évaluation de la vitalité fœtale, surveillance de la grossesse et préparation à l'accouchement.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center shrink-0 border border-slate-200">
          <button
            onClick={() => setActiveTab('mother')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'mother'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Outils Maternels ({ALL_TOOLS.filter((t) => t.category === 'mother').length})
          </button>
          <button
            onClick={() => setActiveTab('baby')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'baby'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Évaluation Fœtale & Bébé ({ALL_TOOLS.filter((t) => t.category === 'baby').length})
          </button>
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          const isSelected = selectedToolId === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => setSelectedToolId(tool.id)}
              className={`bg-white rounded-2xl p-4 border text-left flex items-start gap-3.5 transition-all shadow-xs hover:shadow-md ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white ${tool.gradient}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 truncate">{tool.label}</h3>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>
                <span className="text-[11px] font-semibold text-congo-azure inline-flex items-center gap-1 pt-1">
                  Ouvrir l'outil &rarr;
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Tool Area (Kick Counter Modal or inline card) */}
      {selectedToolId === 'kick-counter' && (
        <KickCounterTool onClose={() => setSelectedToolId(null)} />
      )}

      {selectedToolId && selectedToolId !== 'kick-counter' && (
        <GenericToolInfo
          tool={ALL_TOOLS.find((t) => t.id === selectedToolId)!}
          onClose={() => setSelectedToolId(null)}
          onOpenKickCounter={() => setSelectedToolId('kick-counter')}
        />
      )}
    </div>
  );
}

/**
 * Interactive Kick Counter Tool (Compteur de mouvements fœtaux)
 * Implements the standard WHO / Cardiff Count-to-10 protocol.
 */
function KickCounterTool({ onClose }: { onClose: () => void }) {
  const [kickCount, setKickCount] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [kicks, setKicks] = useState<{ id: number; timestamp: Date; elapsed: number }[]>([]);
  const targetKicks = 10;

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setKickCount(0);
    setKicks([]);
  };

  const handleAddKick = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
    const newCount = kickCount + 1;
    setKickCount(newCount);
    setKicks((prev) => [
      ...prev,
      { id: newCount, timestamp: new Date(), elapsed: seconds },
    ]);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isCompleted = kickCount >= targetKicks;
  const progressPercent = Math.min((kickCount / targetKicks) * 100, 100);

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-500/30 p-5 md:p-6 shadow-md space-y-6">
      {/* Tool Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-blue flex items-center justify-center text-white">
            <Footprints className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
              Compteur de Mouvements Fœtaux (Kick Counter)
            </h2>
            <p className="text-xs text-slate-500">
              Protocole de Cardiff (OMS) : 10 mouvements fœtaux en moins de 2 heures (dès 28 semaines d'aménorrhée).
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Interactive Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Big Kick Tap Button */}
        <div className="md:col-span-2 flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center space-y-5">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Temps écoulé de la séance
            </span>
            <div className="text-4xl font-mono font-bold text-slate-900">
              {formatTime(seconds)}
            </div>
            <p className="text-xs text-slate-500">
              {isRunning ? '🟢 Séance en cours d\'enregistrement' : '⚪ En attente de démarrage'}
            </p>
          </div>

          {/* Huge Clickable Tap Area */}
          <button
            onClick={handleAddKick}
            className={`w-44 h-44 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-lg transition-transform active:scale-95 select-none ${
              isCompleted
                ? 'bg-emerald-600 ring-4 ring-emerald-300'
                : 'bg-blue-600 hover:bg-blue-700 ring-4 ring-blue-200'
            }`}
          >
            <Footprints className="w-10 h-10 mb-1 animate-bounce" />
            <span className="text-2xl font-black">{kickCount}</span>
            <span className="text-xs font-medium uppercase tracking-wider opacity-90">
              {isCompleted ? 'Objectif Atteint' : '+1 Mouvement'}
            </span>
          </button>

          {/* Progress Bar */}
          <div className="w-full max-w-sm space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Progression : {kickCount} / {targetKicks} mouvements</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 pt-2">
            {!isRunning ? (
              <Button onClick={handleStart} size="sm" className="gap-1.5">
                <Play className="w-4 h-4" /> Démarrer la séance
              </Button>
            ) : (
              <Button onClick={handlePause} variant="secondary" size="sm" className="gap-1.5">
                Pause
              </Button>
            )}
            <Button onClick={handleReset} variant="secondary" size="sm" className="gap-1.5">
              <RotateCcw className="w-4 h-4" /> Réinitialiser
            </Button>
          </div>
        </div>

        {/* Right Column: Clinical Status & History */}
        <div className="flex flex-col justify-between space-y-4">
          {/* Status Diagnostic Card */}
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 ${
              isCompleted
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : seconds > 7200 && kickCount < targetKicks
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-sm">
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Vitalité Fœtale Excellente</span>
                </>
              ) : seconds > 7200 && kickCount < targetKicks ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Alerte : Vigilance Fœtale</span>
                </>
              ) : (
                <>
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Surveillance en cours</span>
                </>
              )}
            </div>

            <p className="leading-relaxed">
              {isCompleted
                ? `10 mouvements fœtaux enregistrés en ${Math.ceil(
                    seconds / 60
                  )} minute(s). Le fœtus présente une bonne réactivité motrice.`
                : seconds > 7200 && kickCount < targetKicks
                ? 'Moins de 10 mouvements enregistrés en plus de 2 heures. Consultation clinique recommandée auprès de la maternité.'
                : 'La mère doit être allongée sur le côté gauche ou assise confortablement au calme après un repas.'}
            </p>
          </div>

          {/* Timestamps Log */}
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col">
            <span className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span>Journal des mouvements</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {kicks.length} mouvement(s)
              </span>
            </span>

            <div className="flex-1 overflow-y-auto max-h-40 space-y-1.5 pr-1 text-xs">
              {kicks.length === 0 ? (
                <p className="text-slate-400 text-[11px] italic text-center py-4">
                  Appuyez sur le bouton bleu à chaque coup ou mouvement ressenti.
                </p>
              ) : (
                kicks
                  .slice()
                  .reverse()
                  .map((k) => (
                    <div
                      key={k.id}
                      className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px]"
                    >
                      <span className="text-slate-800 font-bold">Coup #{k.id}</span>
                      <span className="text-slate-500">
                        à {formatTime(k.elapsed)} ({k.timestamp.toLocaleTimeString('fr-FR', { minute: '2-digit', second: '2-digit' })})
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GenericToolInfo({
  tool,
  onClose,
  onOpenKickCounter,
}: {
  tool: ToolDef;
  onClose: () => void;
  onOpenKickCounter: () => void;
}) {
  const Icon = tool.icon;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${tool.gradient}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{tool.label}</h2>
            <p className="text-xs text-slate-500">{tool.description}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
        <p className="font-semibold text-slate-800">
          Module clinique standardisé pour maternités rurales et centres de santé PDL-145T.
        </p>
        <p>
          Cet outil assiste les sages-femmes et agents de santé dans l'application des protocoles du Ministère de la Santé Publique de la RDC pour la réduction de la mortalité néonatale et maternelle.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} size="sm">
          Fermer
        </Button>
        <Button onClick={onOpenKickCounter} size="sm">
          Voir le Kick Counter interactif
        </Button>
      </div>
    </div>
  );
}

export default ToolsPage;
