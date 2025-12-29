import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Shield, 
  FileText, 
  Settings, 
  Grid3x3, 
  Target,
  Users,
  TrendingUp
} from 'lucide-react';
import { useRiskStore } from '../../store/riskStore';

const navigation = [
  { name: 'Executive Dashboard', href: '/', icon: BarChart3 },
  { name: 'Risk Register', href: '/register', icon: FileText },
  { name: 'Risk Matrix', href: '/matrix', icon: Grid3x3 },
  { name: 'Enterprise Roll-Up', href: '/rollup', icon: TrendingUp },
  { name: 'Risk Appetite', href: '/appetite', icon: Target },
  { name: 'Board Reports', href: '/reports', icon: FileText },
  { name: 'User Management', href: '/users', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings }
];

export default function Navigation() {
  const location = useLocation();
  const { currentUser, getBreachedAppetites } = useRiskStore();
  const breachedCount = getBreachedAppetites().length;
  
  return (
    <nav className="bg-white shadow-lg border-r border-gray-200 min-h-screen w-72">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <div className="p-2 bg-blue-600 rounded-lg shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">ERM Platform</h1>
            <p className="text-xs text-blue-600 font-medium">NIST IR 8286r1</p>
          </div>
        </div>
        
        {/* User Info */}
        <div className="mb-8 p-4 glass-effect rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{currentUser.name}</div>
              <div className="text-xs text-gray-600 capitalize">{currentUser.role.replace('-', ' ')}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
            {currentUser.department}
          </div>
        </div>
        
        {/* Breach Alert */}
        {breachedCount > 0 && (
          <div className="mb-6 alert-breach animate-slide-up">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse-soft"></div>
              <div className="text-sm font-semibold text-red-900">
                {breachedCount} Appetite Breach{breachedCount !== 1 ? 'es' : ''}
              </div>
            </div>
            <div className="text-xs text-red-700 mt-1">Immediate action required</div>
          </div>
        )}
        
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`nav-item ${
                    isActive
                      ? 'active'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        
        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <div className="status-online"></div>
            <span>System Online</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Last sync: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </nav>
  );
}