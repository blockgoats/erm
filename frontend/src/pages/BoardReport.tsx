import { useEffect, useState } from 'react';
import { reportsApi, BoardReportData } from '../lib/reports';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function BoardReport() {
  const [report, setReport] = useState<BoardReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const { report } = await reportsApi.getBoardReport();
      setReport(report);
    } catch (error) {
      console.error('Failed to load board report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setGeneratingPDF(true);
    try {
      // For MVP, we'll generate a simple HTML-based PDF using browser print
      window.print();
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('PDF export not yet implemented. Use browser print (Ctrl+P / Cmd+P)');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-red-600" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-green-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return <div className="text-center py-12">Generating board report...</div>;
  }

  if (!report) {
    return <div className="text-center py-12">No report data available</div>;
  }

  return (
    <div className="space-y-8 print:space-y-6">
      {/* Print-only header */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Enterprise Risk Management Report</h1>
        <p className="text-xl text-gray-600">{report.organization_name}</p>
        <p className="text-lg text-gray-500">{report.period}</p>
        <p className="text-sm text-gray-400 mt-2">
          Generated: {format(new Date(report.generated_at), 'MMMM dd, yyyy')}
        </p>
      </div>

      {/* Screen header */}
      <div className="print:hidden flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Board Report</h1>
          <p className="mt-2 text-gray-600">{report.period} - {report.organization_name}</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={generatingPDF}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Download className="w-5 h-5 mr-2" />
          {generatingPDF ? 'Generating...' : 'Export PDF'}
        </button>
      </div>

      {/* Executive Summary */}
      <div className="bg-white rounded-lg shadow p-8 print:shadow-none print:border print:border-gray-300">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 print:text-2xl">Executive Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Risks</div>
            <div className="text-3xl font-bold text-gray-900">{report.summary.total_risks}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Critical Risks</div>
            <div className="text-3xl font-bold text-red-600">{report.summary.critical_risks}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Exposure</div>
            <div className="text-3xl font-bold text-gray-900">{report.summary.total_exposure.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Appetite Breaches</div>
            <div className="text-3xl font-bold text-red-600">{report.summary.breaches_count}</div>
          </div>
        </div>

        {/* Conclusions */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Conclusions</h3>
          <ul className="space-y-3">
            {report.conclusions.map((conclusion, index) => (
              <li key={index} className="text-lg text-gray-900 flex items-start">
                <span className="mr-2">•</span>
                <span>{conclusion}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Appetite Breaches */}
      {report.appetite_breaches.length > 0 && (
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-8 print:border-red-600">
          <div className="flex items-start mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600 flex-shrink-0 print:h-8 print:w-8" />
            <div className="ml-4 flex-1">
              <h2 className="text-3xl font-semibold text-red-900 mb-2 print:text-2xl">Appetite Breaches</h2>
              <p className="text-lg text-red-800 print:text-base">
                The following risks exceed established tolerance thresholds and require immediate board attention:
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {report.appetite_breaches.map((breach, index) => (
              <div key={index} className="bg-white rounded-lg p-6 border border-red-300 print:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-semibold text-gray-900 print:text-xl">{breach.risk_title}</div>
                    <div className="text-base text-gray-600 mt-1 print:text-sm capitalize">{breach.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 print:text-xs">Breach Value</div>
                    <div className="text-3xl font-bold text-red-600 print:text-2xl">{breach.breach_value.toFixed(1)}</div>
                    <div className="text-sm text-gray-500 mt-1 print:text-xs">Threshold: {breach.threshold}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Enterprise Risks */}
      <div className="bg-white rounded-lg shadow p-8 print:shadow-none print:border print:border-gray-300">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 print:text-2xl">Top Enterprise Risks</h2>
        <div className="space-y-6">
          {report.top_risks.map((risk) => (
            <div key={risk.rank} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-gray-400 print:text-xl">#{risk.rank}</span>
                    <h3 className="text-2xl font-semibold text-gray-900 print:text-xl">{risk.title}</h3>
                    {getTrendIcon(risk.trend)}
                  </div>
                  <div className="text-base text-gray-600 capitalize print:text-sm">{risk.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 print:text-xs">Exposure</div>
                  <div className={`text-3xl font-bold print:text-2xl ${
                    risk.exposure >= 20 ? 'text-red-600' :
                    risk.exposure >= 10 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {risk.exposure.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="hidden print:block text-center text-sm text-gray-500 mt-8 pt-8 border-t border-gray-300">
        <p>Confidential - For Board Use Only</p>
        <p className="mt-1">Generated by NIST 8286 ERM Platform</p>
      </div>
    </div>
  );
}

