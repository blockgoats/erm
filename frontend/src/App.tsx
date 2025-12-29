import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import Layout from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import ToastContainer from './components/Toast';
import LoginPage from './pages/LoginPage';
import RiskRegisterPage from './pages/RiskRegisterPage';
import RiskScoringPage from './pages/RiskScoringPage';
import EnterpriseRiskPage from './pages/EnterpriseRiskPage';
import RiskAppetitePage from './pages/RiskAppetitePage';
import ExecutiveDashboardPage from './pages/ExecutiveDashboardPage';
import BoardReportPage from './pages/BoardReportPage';
import RiskDetail from './pages/RiskDetail';
import AuditLogPage from './pages/AuditLogPage';
import ControlsLibraryPage from './pages/ControlsLibraryPage';
import AuditFindingsPage from './pages/AuditFindingsPage';
import WorkflowsPage from './pages/WorkflowsPage';
import RiskFrameworkPage from './pages/RiskFrameworkPage';
import KRIDashboard from './pages/KRIDashboard';
import BoardReport from './pages/BoardReport';
import RiskHeatmap from './pages/RiskHeatmap';
import LandingPage from './pages/LandingPage';
import DocumentUploadPage from './pages/DocumentUploadPage';
import DocumentReviewPage from './pages/DocumentReviewPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAppStore((state) => state.user);
  const initialize = useAppStore((state) => state.initialize);
  
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const initialize = useAppStore((state) => state.initialize);
  
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<ExecutiveDashboardPage />} />
          <Route path="risks" element={<RiskRegisterPage />} />
          <Route path="risks/:id" element={<RiskDetail />} />
          <Route path="audit" element={<AuditLogPage />} />
          <Route path="controls" element={<ControlsLibraryPage />} />
          <Route path="findings" element={<AuditFindingsPage />} />
          <Route path="workflows" element={<WorkflowsPage />} />
          <Route path="risk-framework" element={<RiskFrameworkPage />} />
          <Route path="scoring" element={<RiskScoringPage />} />
          <Route path="heatmap" element={<RiskHeatmap />} />
          <Route path="enterprise-risks" element={<EnterpriseRiskPage />} />
          <Route path="appetite" element={<RiskAppetitePage />} />
          <Route path="kri" element={<KRIDashboard />} />
          <Route path="board-report" element={<BoardReport />} />
          <Route path="board-report-old" element={<BoardReportPage />} />
          <Route path="documents/upload" element={<DocumentUploadPage />} />
          <Route path="documents/review" element={<DocumentReviewPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
