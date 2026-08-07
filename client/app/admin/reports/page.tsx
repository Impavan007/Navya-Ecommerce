'use client';

import { useState } from 'react';
import ReportsHeader from './components/ReportsHeader';
import ReportCategories from './components/ReportCategories';
import KPIOverview from './components/KPIOverview';
import ReportBuilder from './components/ReportBuilder';
import ChartView from './components/ChartView';
import ReportResults from './components/ReportResults';
import ExportModal from './components/ExportModal';
import SaveReportModal from './components/SaveReportModal';

export default function ReportsPage() {
  const [activeCategory, setActiveCategory] = useState('Overview');
  const [showChartView, setShowChartView] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [reportFilters, setReportFilters] = useState<any>({
    dateRange: '30d',
    status: 'all',
    userRole: 'all',
    amountMin: '',
    amountMax: '',
    customDateFrom: '',
    customDateTo: ''
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleGenerateReport = (filters: any) => {
    setReportFilters(filters);
    // Mock data generation logic - in real app, this would call an API
    setReportData({
      generatedAt: new Date().toISOString(),
      summary: {
        totalItems: 1250,
        growth: '+12.5%',
        averageValue: 'Rs.85.00'
      }
    });
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleSaveReport = () => {
    setShowSaveModal(true);
  };

  return (
    <div className="p-8 space-y-8 min-h-screen bg-gray-50">
      <ReportsHeader
        onExport={handleExport}
        onSaveReport={handleSaveReport}
        showChartView={showChartView}
        onToggleChart={() => setShowChartView(!showChartView)}
      />

      <ReportCategories
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <KPIOverview />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <ReportBuilder
            category={activeCategory}
            onGenerateReport={handleGenerateReport}
            filters={reportFilters}
          />
        </div>

        <div className="lg:col-span-3 space-y-6">
          {showChartView && reportData && (
            <ChartView category={activeCategory} data={reportData} />
          )}

          <ReportResults
            category={activeCategory}
            data={reportData}
            onExport={handleExport}
          />
        </div>
      </div>

      {showExportModal && (
        <ExportModal
          category={activeCategory}
          data={reportData}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showSaveModal && (
        <SaveReportModal
          category={activeCategory}
          filters={reportFilters}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}
