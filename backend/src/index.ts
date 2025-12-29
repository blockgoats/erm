import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDatabase } from './db/index.js';
import authRoutes from './routes/auth.js';
import riskRoutes from './routes/risks.js';
import scoringRoutes from './routes/scoring.js';
import enterpriseRiskRoutes from './routes/enterpriseRisks.js';
import appetiteRoutes from './routes/appetite.js';
import kriRoutes from './routes/kri.js';
import reportsRoutes from './routes/reports.js';
import importRoutes from './routes/import.js';
import auditRoutes from './routes/audit.js';
import evidenceRoutes from './routes/evidence.js';
import controlsRoutes from './routes/controls.js';
import treatmentRoutes from './routes/treatment.js';
import workflowRoutes from './routes/workflow.js';
import riskFrameworkRoutes from './routes/riskFramework.js';
import complianceRoutes from './routes/compliance.js';
import governanceRoutes from './routes/governance.js';
import maturityRoutes from './routes/maturity.js';
import documentsRoutes from './routes/documents.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
getDatabase();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/scoring', scoringRoutes);
app.use('/api/enterprise-risks', enterpriseRiskRoutes);
app.use('/api/appetite', appetiteRoutes);
app.use('/api/kri', kriRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/import', importRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/controls', controlsRoutes);
app.use('/api/treatment', treatmentRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/risk-framework', riskFrameworkRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/maturity', maturityRoutes);
app.use('/api/documents', documentsRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 ERM Backend server running on http://localhost:${PORT}`);
});

