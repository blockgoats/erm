import React, { useEffect, useState } from 'react';
import { Scale, FolderTree, Settings, History } from 'lucide-react';

export default function RiskFrameworkPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Risk Management Framework</h1>
        <p className="mt-2 text-sm text-gray-600">
          Configure risk taxonomy, scoring scales, and framework settings
        </p>
      </div>

      <Tabs defaultValue="scales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scales">
            <Scale className="w-4 h-4 mr-2" />
            Scoring Scales
          </TabsTrigger>
          <TabsTrigger value="taxonomy">
            <FolderTree className="w-4 h-4 mr-2" />
            Risk Taxonomy
          </TabsTrigger>
          <TabsTrigger value="framework">
            <Settings className="w-4 h-4 mr-2" />
            Framework Settings
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Version History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scales">
          <ScoringScalesTab />
        </TabsContent>

        <TabsContent value="taxonomy">
          <RiskTaxonomyTab />
        </TabsContent>

        <TabsContent value="framework">
          <FrameworkSettingsTab />
        </TabsContent>

        <TabsContent value="history">
          <FrameworkHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Simple Tabs component since we don't have shadcn/ui
function Tabs({ defaultValue, children, className }: any) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const tabsList = children.find((child: any) => child.type === TabsList);
  const tabsContent = children.filter((child: any) => child.type === TabsContent);

  return (
    <div className={className}>
      {tabsList && <div>{React.cloneElement(tabsList, { activeTab, setActiveTab })}</div>}
      {tabsContent.map((content: any) => 
        content.props.value === activeTab ? content : null
      )}
    </div>
  );
}

function TabsList({ children, activeTab, setActiveTab }: any) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {React.Children.map(children, (child) =>
          React.cloneElement(child, { activeTab, setActiveTab })
        )}
      </nav>
    </div>
  );
}

function TabsTrigger({ value, children, activeTab, setActiveTab }: any) {
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`py-4 px-1 border-b-2 font-medium text-sm ${
        isActive
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, children }: any) {
  return <div>{children}</div>;
}


function ScoringScalesTab() {
  const [scales, setScales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'likelihood' | 'impact'>('likelihood');

  useEffect(() => {
    loadScales();
  }, [selectedType]);

  const loadScales = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/risk-framework/scales?scale_type=${selectedType}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const { scales } = await response.json();
      setScales(scales);
    } catch (error) {
      console.error('Failed to load scales:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedType('likelihood')}
            className={`px-4 py-2 rounded-lg ${
              selectedType === 'likelihood'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Likelihood
          </button>
          <button
            onClick={() => setSelectedType('impact')}
            className={`px-4 py-2 rounded-lg ${
              selectedType === 'impact'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Impact
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading scales...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scales.map((scale) => (
                <tr key={scale.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {scale.level}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {scale.label}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {scale.description || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RiskTaxonomyTab() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Risk Taxonomy Builder - Coming soon</p>
    </div>
  );
}

function FrameworkSettingsTab() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Framework Settings - Coming soon</p>
    </div>
  );
}

function FrameworkHistoryTab() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Framework Version History - Coming soon</p>
    </div>
  );
}

