/**
 * Document Review Queue
 * 
 * Review low-confidence extractions from document processing.
 */

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { documentsApi, ExtractedClause } from '../lib/documents';

export default function DocumentReviewPage() {
  const [reviewQueue, setReviewQueue] = useState<ExtractedClause[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClause, setSelectedClause] = useState<ExtractedClause | null>(null);

  useEffect(() => {
    loadReviewQueue();
  }, []);

  const loadReviewQueue = async () => {
    try {
      const { review_queue } = await documentsApi.getReviewQueue();
      setReviewQueue(review_queue);
    } catch (error) {
      console.error('Failed to load review queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getClauseTypeColor = (type: string | null) => {
    switch (type) {
      case 'obligation': return 'bg-blue-100 text-blue-800';
      case 'prohibition': return 'bg-red-100 text-red-800';
      case 'penalty': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 animate-pulse-soft">
        <div className="text-body text-gray-600 font-medium">Loading review queue...</div>
      </div>
    );
  }

  if (reviewQueue.length === 0) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="card-elevated p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-title text-gray-900 mb-3">Review Queue Empty</h2>
          <p className="text-body text-gray-600 max-w-md mx-auto">
            All extracted clauses have been reviewed or there are no documents requiring review.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-headline text-gray-900 mb-3 gradient-text">Review Queue</h1>
        <p className="text-body text-gray-600">
          Review and approve extracted clauses from document processing. 
          <span className="font-semibold text-gray-900 ml-1">
            {reviewQueue.length} item{reviewQueue.length !== 1 ? 's' : ''} pending review.
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue List */}
        <div className="lg:col-span-1">
          <div className="card-elevated">
            <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Pending Review</h2>
              <p className="text-xs text-gray-600 mt-1">{reviewQueue.length} items</p>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto scroll-area">
              {reviewQueue.map((clause, index) => (
                <button
                  key={clause.id}
                  onClick={() => setSelectedClause(clause)}
                  className={`w-full text-left p-4 card-interactive ${
                    selectedClause?.id === clause.id 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 shadow-md' 
                      : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getClauseTypeColor(clause.clause_type)}`}>
                      {clause.clause_type || 'other'}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      clause.confidence_score >= 0.8 
                        ? 'bg-green-100 text-green-700' 
                        : clause.confidence_score >= 0.6 
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {Math.round(clause.confidence_score * 100)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                    {clause.clause_text.substring(0, 100)}...
                  </p>
                  {clause.clause_number && (
                    <p className="text-xs text-gray-500 mt-2 font-medium">Clause {clause.clause_number}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2">
          {selectedClause ? (
            <div className="card-elevated p-8 animate-slide-up">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${getClauseTypeColor(selectedClause.clause_type)}`}>
                      {selectedClause.clause_type || 'other'}
                    </span>
                    {selectedClause.clause_number && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-full font-medium">
                        Clause {selectedClause.clause_number}
                      </span>
                    )}
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                      selectedClause.confidence_score >= 0.8 
                        ? 'bg-green-100 text-green-700' 
                        : selectedClause.confidence_score >= 0.6 
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {Math.round(selectedClause.confidence_score * 100)}% confidence
                    </span>
                  </div>
                  <h3 className="text-title text-gray-900">Extracted Clause</h3>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 mb-6 border border-gray-200">
                <p className="text-body text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedClause.clause_text}</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="alert-warning mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Review Required</p>
                      <p className="text-xs text-gray-700">
                        This clause was automatically extracted and requires review. 
                        You can approve it, reject it, or modify it.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="btn-primary click-scale bg-green-600 hover:bg-green-700 focus:ring-green-200">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button className="btn-danger click-scale">
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                  <button className="btn-secondary click-scale">
                    Modify
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-elevated p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-body text-gray-600 font-medium">Select a clause from the queue to review</p>
              <p className="text-caption mt-2">Click on any item in the left panel to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

