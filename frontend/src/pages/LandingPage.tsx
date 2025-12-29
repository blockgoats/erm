/**
 * Landing Page - Enterprise-Grade
 * 
 * Principles Applied:
 * - Calm, professional aesthetic
 * - Clear value proposition
 * - Enterprise authority
 * - No marketing fluff
 * - Business-focused messaging
 * - Trust-building elements
 */

import { Link } from 'react-router-dom';
import { Shield, BarChart3, FileText, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Minimal, Professional */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-gray-700" />
              <h1 className="text-lg font-semibold text-gray-900">Enterprise Risk Management</h1>
            </div>
            <Link
              to="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Clear Value Proposition */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-semibold text-gray-900 mb-4">
              Enterprise Cyber Risk Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              NIST IR 8286r1-aligned platform for identifying, assessing, and managing cybersecurity risks at enterprise scale.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Access Platform
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features - Enterprise-Focused */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Enterprise-Grade Risk Management
            </h3>
            <p className="text-gray-600">
              Built for CISOs, Risk Officers, and Board Members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Risk Assessment</h4>
              </div>
              <p className="text-sm text-gray-600">
                Comprehensive risk register with scenario-based assessment. Identify threats, vulnerabilities, and impacts with deterministic scoring.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Enterprise Roll-Up</h4>
              </div>
              <p className="text-sm text-gray-600">
                Aggregate system-level risks into enterprise view. System → Organization → Enterprise hierarchy per NIST standards.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Board Reporting</h4>
              </div>
              <p className="text-sm text-gray-600">
                Executive-ready reports with clear conclusions. Understand enterprise risk in under 30 seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Capabilities - Dense, Informative */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                NIST IR 8286r1 Alignment
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 mr-2" />
                  <span className="text-sm text-gray-700">Cybersecurity Risk Register (CSRR) with scenario-based assessment</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 mr-2" />
                  <span className="text-sm text-gray-700">Enterprise Risk Register (ERR) with hierarchical roll-up</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 mr-2" />
                  <span className="text-sm text-gray-700">Risk appetite and tolerance governance</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 mr-2" />
                  <span className="text-sm text-gray-700">Deterministic risk scoring (Likelihood × Impact)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Enterprise Features
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 mr-2" />
                  <span className="text-sm text-gray-700">Role-based access control (CISO, ERM, Executive, Auditor)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 mr-2" />
                  <span className="text-sm text-gray-700">Complete audit trail and version history</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 mr-2" />
                  <span className="text-sm text-gray-700">Evidence linking and one-click access</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 mr-2" />
                  <span className="text-sm text-gray-700">Data import from Excel risk registers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators - Minimal, Professional */}
      <section className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Built for Enterprise Risk Management
            </h3>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Designed for CISOs, Risk Officers, and Board Members who need defensible, auditable, and explainable risk management.
            </p>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Enterprise Risk Management Platform
            </p>
            <Link
              to="/login"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

