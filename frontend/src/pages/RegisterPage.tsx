import React from 'react';
import Layout from '../components/layout/Layout';
import RiskRegister from '../components/risk/RiskRegister';

export default function RegisterPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Register</h1>
          <p className="text-gray-600">Comprehensive Cyber Security Risk Register with inline editing</p>
        </div>
        <RiskRegister />
      </div>
    </Layout>
  );
}