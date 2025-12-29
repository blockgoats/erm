import React from 'react';
import Layout from '../components/layout/Layout';
import { FileDown, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

export default function ReportsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Board Reports</h1>
          <p className="text-gray-600">McKinsey-style executive presentations and quarterly reports</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center py-12">
            <FileDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Board Report Generation</h3>
            <p className="text-gray-600 mb-6">
              Generate comprehensive quarterly risk reports with executive summaries,
              trend analysis, and clear action items.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Generate Q4 2024 Report
            </button>
          </div>
        </div>
        
        {/* Report Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Quarterly Executive Summary</h3>
            </div>
            <p className="text-gray-600 mb-4">
              High-level risk posture overview with key metrics, trend analysis, and appetite breach alerts.
            </p>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Preview Template →
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Risk Trend Analysis</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Detailed quarter-over-quarter comparison with risk movement indicators and explanations.
            </p>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Preview Template →
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}