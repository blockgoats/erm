import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import MatrixPage from './pages/MatrixPage';
import RollupPage from './pages/RollupPage';
import AppetitePage from './pages/AppetitePage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/matrix" element={<MatrixPage />} />
          <Route path="/rollup" element={<RollupPage />} />
          <Route path="/appetite" element={<AppetitePage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;