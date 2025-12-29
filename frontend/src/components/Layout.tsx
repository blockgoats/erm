import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { authApi } from '../lib/auth';
import { Shield, FileText, BarChart3, LogOut, Menu, History, CheckSquare, AlertTriangle, Workflow, Upload } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const logout = () => {
    // Clear auth data
    authApi.logout();
    // Clear app store
    setUser(null);
    // Redirect to login
    window.location.href = '/login';
  };

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: BarChart3 },
    { name: 'Risk Register', href: '/app/risks', icon: FileText },
    { name: 'Upload Document', href: '/app/documents/upload', icon: Upload },
    { name: 'Enterprise Risks', href: '/app/enterprise-risks', icon: Shield },
    { name: 'Risk Heatmap', href: '/app/heatmap', icon: BarChart3 },
    { name: 'Risk Appetite', href: '/app/appetite', icon: Shield },
    { name: 'Board Report', href: '/app/board-report', icon: FileText },
    { name: 'KRIs', href: '/app/kri', icon: BarChart3 },
    { name: 'Controls', href: '/app/controls', icon: CheckSquare },
    { name: 'Audit Findings', href: '/app/findings', icon: AlertTriangle },
    { name: 'Workflows', href: '/app/workflows', icon: Workflow },
    { name: 'Audit Log', href: '/app/audit', icon: History },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">ERM Platform</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="px-4 py-2 text-sm text-gray-600">
              <div className="font-medium">{user?.fullName || user?.email}</div>
              <div className="text-xs text-gray-500">{user?.roles?.join(', ') || 'No roles'}</div>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">ERM Platform</h1>
          <div className="w-6" />
        </div>

        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
