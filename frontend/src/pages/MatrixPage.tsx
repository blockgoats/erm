import React from 'react';
import Layout from '../components/layout/Layout';
import RiskMatrix from '../components/risk/RiskMatrix';

export default function MatrixPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Assessment Matrix</h1>
          <p className="text-gray-600">Interactive 5×5 matrix with business context tooltips</p>
        </div>
        <RiskMatrix />
      </div>
    </Layout>
  );
}