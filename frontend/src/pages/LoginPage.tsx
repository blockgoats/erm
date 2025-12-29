/**
 * Login Page - Enterprise-Grade
 * 
 * Principles Applied:
 * - Calm, professional aesthetic
 * - Clear, plain language
 * - No decorative elements
 * - Semantic color only
 * - Enterprise authority
 * - Self-explanatory
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { authApi } from '../lib/auth';
import { Shield, User, Briefcase, TrendingUp, Target } from 'lucide-react';

interface DemoAccount {
  email: string;
  password: string;
  label: string;
  role: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'admin@acme.com',
    password: 'admin123',
    label: 'Administrator',
    role: 'Full Access',
    icon: Shield,
    description: 'Complete platform access',
  },
  {
    email: 'riskmanager@acme.com',
    password: 'manager123',
    label: 'Risk Manager',
    role: 'Risk Management',
    icon: Briefcase,
    description: 'Risk assessment & treatment',
  },
  {
    email: 'executive@acme.com',
    password: 'exec123',
    label: 'Executive',
    role: 'Executive View',
    icon: TrendingUp,
    description: 'Dashboards & reports',
  },
  {
    email: 'riskowner@acme.com',
    password: 'owner123',
    label: 'Risk Owner',
    role: 'Risk Owner',
    icon: Target,
    description: 'Own risk management',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAppStore((state) => state.setUser);

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setError('');
    setLoading(true);

    try {
      // Call actual auth API
      const result = await authApi.login({ email: loginEmail, password: loginPassword });
      const user = result.user;
      
      // Convert AuthUser to User type for useAppStore
      const appUser = {
        id: user.id,
        email: user.email,
        fullName: user.full_name || user.email.split('@')[0],
        organizationId: user.organization_id || 'org-1',
        roles: user.roles as any,
      };
      
      setUser(appUser);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleDemoLogin = async (account: DemoAccount) => {
    setEmail(account.email);
    setPassword(account.password);
    await performLogin(account.email, account.password);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Minimal, Professional */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-gray-700" />
            <h1 className="text-lg font-semibold text-gray-900">Enterprise Risk Management</h1>
          </div>
        </div>
      </div>

      {/* Main Content - Centered, Calm */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                Sign In
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Access your organization's risk management platform
              </p>
            </div>

            {/* Demo Accounts Section */}
            <div className="mb-6">
              <div className="text-center mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Quick Demo Access</p>
                <p className="text-xs text-gray-500">Click any account to login instantly</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((account) => {
                  const Icon = account.icon;
                  return (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => handleDemoLogin(account)}
                      disabled={loading}
                      className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 mb-1" />
                      <span className="text-xs font-medium text-gray-900 group-hover:text-blue-900">
                        {account.label}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">{account.role}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign in manually</span>
              </div>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-4">
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="your.email@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </div>
            </form>

            {/* Footer - Minimal, Professional */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">
                NIST IR 8286r1-aligned Enterprise Risk Management Platform
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Minimal */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-center text-gray-500">
            © {new Date().getFullYear()} Enterprise Risk Management Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
