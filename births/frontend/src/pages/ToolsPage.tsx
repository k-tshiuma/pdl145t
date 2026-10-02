import { useState } from 'react';
import { ChevronLeft, Bell, Calculator, Calendar, Activity, Clock, Heart, Move, Stethoscope, Scale } from 'lucide-react';

const TOOLS = [
  { id: 'pregnancy-calc', label: 'Pregnancy Calculator', icon: Calculator, gradient: 'bg-gradient-pink-red' },
  { id: 'conception-calc', label: 'Conception Calculator', icon: Calendar, gradient: 'bg-gradient-teal' },
  { id: 'ovulation-calc', label: 'Ovulation Calculator', icon: Activity, gradient: 'bg-gradient-orange' },
  { id: 'kick-counter', label: 'Kick Counter', icon: Move, gradient: 'bg-gradient-blue' },
  { id: 'first-move', label: "Baby's First Move", icon: Activity, gradient: 'bg-gradient-purple' },
  { id: 'first-heartbeat', label: "Baby's First Heartbeat", icon: Heart, gradient: 'bg-gradient-crimson' },
  { id: 'pregnancy-trimester', label: 'Pregnancy Trimester', icon: Clock, gradient: 'bg-gradient-plum' },
  { id: 'pregnancy-age', label: "Pregnancy's Current Age", icon: Calendar, gradient: 'bg-gradient-primary' },
  { id: 'symptoms-tracker', label: 'Symptoms Tracker', icon: Stethoscope, gradient: 'bg-gradient-teal' },
  { id: 'contraction-timer', label: 'Contraction Timer', icon: Clock, gradient: 'bg-gradient-orange' },
  { id: 'bmi', label: 'BMI', icon: Scale, gradient: 'bg-gradient-blue' },
];

export function ToolsPage() {
  const [activeTab, setActiveTab] = useState<'mother' | 'baby'>('mother');

  return (
    <div className="min-h-screen bg-page-bg font-sans w-full flex flex-col relative overflow-hidden">
      
      {/* Top App Bar */}
      <header className="flex items-center justify-between px-4 py-4 bg-app-surface shadow-sm">
        <button className="p-2 -ml-2 text-primary-text rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-body-lg font-bold text-primary-text">Tools</h1>
        <button className="p-2 -mr-2 text-primary-text rounded-full relative hover:bg-gray-100 transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        
        {/* Segmented Control */}
        <div className="bg-gray-200/50 p-1 rounded-full flex mb-6 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('mother')}
            className={`flex-1 py-2 text-center rounded-full text-label-lg transition-colors ${
              activeTab === 'mother' ? 'bg-app-surface text-primary-text shadow-sm' : 'text-secondary-text'
            }`}
          >
            Mother tools
          </button>
          <button
            onClick={() => setActiveTab('baby')}
            className={`flex-1 py-2 text-center rounded-full text-label-lg transition-colors ${
              activeTab === 'baby' ? 'bg-app-surface text-primary-text shadow-sm' : 'text-secondary-text'
            }`}
          >
            Baby Assessment
          </button>
        </div>

        {/* Active Category Label */}
        <div className="flex justify-center mb-8">
          <span className="bg-primary-text text-app-surface px-6 py-2 rounded-full text-label-lg shadow-sm">
            {activeTab === 'mother' ? 'Mother Tools' : 'Baby Assessment'}
          </span>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                className="flex flex-col items-center group active:scale-[0.96] transition-transform duration-200"
              >
                <div
                  className={`w-14 h-14 ${tool.gradient} rounded-2xl flex items-center justify-center mb-2 shadow-sm group-hover:shadow-soft transition-shadow`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-center text-[11px] leading-tight font-semibold text-primary-text px-1 max-w-[80px]">
                  {tool.label}
                </span>
              </button>
            );
          })}
        </div>
        
      </main>
    </div>
  );
}
