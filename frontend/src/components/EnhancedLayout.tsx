import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { 
  Shield, FileText, BarChart3, LogOut, Menu, History, 
  CheckSquare, AlertTriangle, Workflow, Settings, Search,
  X, ChevronDown, ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs';

interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
}

export default function EnhancedLayout() {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [searchOpen, setSearchOpen] = useState(false);

  const logout = () => {
    setUser(null);
    window.location.href = '/login';
  };

  const navigation: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', href: '/app/dashboard', icon: BarChart3 },
      ],
    },
    {
      title: 'Risk Management',
      items: [
        { name: 'Risk Register', href: '/app/risks', icon: FileText },
        { name: 'Enterprise Risks', href: '/app/enterprise-risks', icon: Shield },
        { name: 'Risk Heatmap', href: '/app/heatmap', icon: BarChart3 },
        { name: 'Risk Appetite', href: '/app/appetite', icon: Shield },
      ],
    },
    {
      title: 'Governance & Compliance',
      items: [
        { name: 'Controls', href: '/app/controls', icon: CheckSquare },
        { name: 'Audit Findings', href: '/app/findings', icon: AlertTriangle },
        { name: 'Audit Log', href: '/app/audit', icon: History },
      ],
    },
    {
      title: 'Operations',
      items: [
        { name: 'Workflows', href: '/app/workflows', icon: Workflow },
        { name: 'KRIs', href: '/app/kri', icon: BarChart3 },
        { name: 'Board Report', href: '/app/board-report', icon: FileText },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { name: 'Risk Framework', href: '/app/risk-framework', icon: Settings },
      ],
    },
  ];

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate breadcrumbs from current path
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (pathParts.length > 1 && pathParts[0] === 'app') {
      const pageName = pathParts[1];
      const pageLabel = navigation
        .flatMap((s) => s.items)
        .find((item) => item.href.includes(pageName))?.name || pageName;

      breadcrumbs.push({ label: pageLabel });

      if (pathParts.length > 2) {
        breadcrumbs.push({ label: pathParts[2] });
      }
    }

    return breadcrumbs;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-lg font-bold text-gray-900">ERM Platform</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Search... (⌘K)</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {navigation.map((section) => {
              const isCollapsed = collapsedSections.has(section.title);
              const hasActiveItem = section.items.some(
                (item) => location.pathname === item.href
              );

              return (
                <div key={section.title}>
                  {section.collapsible !== false && (
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                    >
                      <span>{section.title}</span>
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  {!isCollapsed && (
                    <div className="space-y-1 mt-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5" />
                              <span>{item.name}</span>
                            </div>
                            {item.badge && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="px-3 py-2 text-sm text-gray-600 mb-2">
              <div className="font-medium">{user?.fullName || user?.email}</div>
              <div className="text-xs text-gray-500">{user?.roles?.join(', ') || 'No roles'}</div>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">ERM Platform</h1>
          <button
            onClick={() => setSearchOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>

        <main className="p-6">
          {/* Breadcrumbs */}
          {getBreadcrumbs().length > 0 && (
            <Breadcrumbs items={getBreadcrumbs()} />
          )}
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Search Modal */}
      {searchOpen && (
        <GlobalSearch onClose={() => setSearchOpen(false)} />
      )}
    </div>
  );
}

function GlobalSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');

  // This would integrate with a search service
  const searchResults: any[] = []; // Placeholder

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search risks, controls, reports..."
              className="flex-1 outline-none text-lg"
            />
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4">
          {query ? (
            <div className="text-sm text-gray-500">
              Search results for "{query}" would appear here
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              <div className="font-medium mb-2">Quick Actions:</div>
              <div className="space-y-1">
                <div className="px-2 py-1 hover:bg-gray-50 rounded">Create Risk</div>
                <div className="px-2 py-1 hover:bg-gray-50 rounded">View Dashboard</div>
                <div className="px-2 py-1 hover:bg-gray-50 rounded">Generate Report</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

