import React from 'react';
import Layout from '../components/layout/Layout';
import RiskAppetite from '../components/appetite/RiskAppetite';

export default function AppetitePage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Appetite & Tolerance</h1>
          <p className="text-gray-600">Define and monitor organizational risk boundaries</p>
        </div>
        <RiskAppetite />
      </div>
    </Layout>
  );
}