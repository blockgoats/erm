import React from 'react';
import Layout from '../components/layout/Layout';
import EnterpriseRollup from '../components/rollup/EnterpriseRollup';

export default function RollupPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enterprise Risk Roll-Up</h1>
          <p className="text-gray-600">Top 10 enterprise risks with prioritization focus</p>
        </div>
        <EnterpriseRollup />
      </div>
    </Layout>
  );
}