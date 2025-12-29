import { useEffect, useState } from 'react';
import { scoringApi } from '../lib/risks';

export default function RiskHeatmap() {
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [maxExposure, setMaxExposure] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatrix();
  }, []);

  const loadMatrix = async () => {
    try {
      const { matrix: matrixData } = await scoringApi.getMatrix();
      setMatrix(matrixData.matrix);
      setMaxExposure(matrixData.maxExposure);
    } catch (error) {
      console.error('Failed to load matrix:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCellColor = (value: number) => {
    if (maxExposure === 0) return 'bg-gray-100';
    const intensity = value / maxExposure;
    if (intensity > 0.7) return 'bg-red-600';
    if (intensity > 0.4) return 'bg-yellow-500';
    if (intensity > 0.1) return 'bg-yellow-300';
    return 'bg-green-200';
  };

  if (loading) {
    return <div className="text-center py-12">Loading heatmap...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Risk Heatmap</h1>
        <p className="mt-2 text-gray-600">Visual representation of risk exposure by likelihood and impact</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Risk Matrix</h2>
          <p className="text-sm text-gray-600">
            The heatmap shows aggregated risk exposure. Darker colors indicate higher exposure.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-24"></th>
                {[1, 2, 3, 4, 5].map((impact) => (
                  <th key={impact} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300">
                    Impact {impact}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, likelihoodIdx) => (
                <tr key={likelihoodIdx}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 bg-gray-50">
                    Likelihood {likelihoodIdx + 1}
                  </td>
                  {row.map((value, impactIdx) => (
                    <td
                      key={impactIdx}
                      className={`px-4 py-2 text-center text-sm font-medium text-gray-900 border border-gray-300 ${getCellColor(value)}`}
                    >
                      {value > 0 ? value : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            <span className="text-sm text-gray-600">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-300 rounded"></div>
            <span className="text-sm text-gray-600">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-sm text-gray-600">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}

