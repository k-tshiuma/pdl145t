import Dashboard from '../../components/statistics/Dashboard';

export function StatisticsPage() {
  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-slate-50">
      <div className="flex-1 overflow-auto">
        <Dashboard />
      </div>
    </div>
  );
}
export default StatisticsPage;
