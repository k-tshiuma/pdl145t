import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { logger } from './utils/logger';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { auditMiddleware } from './middleware/audit.middleware';

// Repositories SQLite
import { getDatabase } from './database/connection';
import { SqliteUserRepository } from './repositories/sqlite/SqliteUserRepository';
import { SqliteParentRepository } from './repositories/sqlite/SqliteParentRepository';
import { SqliteChildRepository } from './repositories/sqlite/SqliteChildRepository';
import { SqliteBirthRepository } from './repositories/sqlite/SqliteBirthRepository';
import { SqliteClinicalRepository } from './repositories/sqlite/SqliteClinicalRepository';
import { SqliteVaccineRepository } from './repositories/sqlite/SqliteVaccineRepository';
import { SqliteCertificateRepository } from './repositories/sqlite/SqliteCertificateRepository';
import { SqliteAuditRepository } from './repositories/sqlite/SqliteAuditRepository';

// Services
import { AuthService } from './services/auth.service';
import { ParentService } from './services/parent.service';
import { BirthService } from './services/birth.service';
import { IdentifierService } from './services/identifier.service';
import { PDFService } from './services/pdf.service';

// Controllers
import { AuthController } from './controllers/auth.controller';
import { ParentsController } from './controllers/parents.controller';
import { BirthsController } from './controllers/births.controller';
import { DashboardController } from './controllers/dashboard.controller';

// Routes
import { createAuthRoutes } from './routes/auth.routes';
import { createParentRoutes } from './routes/parents.routes';
import { createBirthRoutes } from './routes/births.routes';
import { createGeoRoutes } from './routes/geo.routes';
import { createDashboardRoutes } from './routes/dashboard.routes';

/**
 * Crée et configure l'application Express.
 * Tous les composants sont instanciés ici (injection de dépendances manuelle).
 */
export function createApp() {
  const app = express();
  const db = getDatabase();

  // ── Repositories ──────────────────────────────────────────────────────────
  const userRepo = new SqliteUserRepository(db);
  const parentRepo = new SqliteParentRepository(db);
  const childRepo = new SqliteChildRepository(db);
  const birthRepo = new SqliteBirthRepository(db);
  const clinicalRepo = new SqliteClinicalRepository(db);
  const vaccineRepo = new SqliteVaccineRepository(db);
  const certRepo = new SqliteCertificateRepository(db);
  const auditRepo = new SqliteAuditRepository(db);

  // ── Services ─────────────────────────────────────────────────────────────
  const authService = new AuthService(userRepo, auditRepo);
  const parentService = new ParentService(parentRepo, auditRepo);
  const identifierService = new IdentifierService();
  const pdfService = new PDFService(birthRepo, childRepo, parentRepo, certRepo);
  const birthService = new BirthService(birthRepo, childRepo, certRepo, auditRepo, identifierService);

  // ── Controllers ──────────────────────────────────────────────────────────
  const authController = new AuthController(authService);
  const parentsController = new ParentsController(parentService);
  const birthsController = new BirthsController(birthService, pdfService, certRepo);
  const dashboardController = new DashboardController();

  // ── Middleware globaux ───────────────────────────────────────────────────

  // Sécurité HTTP headers
  app.use(helmet({
    crossOriginEmbedderPolicy: false, // Pour le PDF viewer
  }));

  // CORS
  app.use(cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Rate limiting global
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 300 requêtes par IP
    message: { success: false, error: { message: 'Trop de requêtes. Veuillez réessayer dans quelques minutes.' } },
  }));

  // Rate limiting strict pour l'auth (protection brute force)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, error: { message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.' } },
  });

  // Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Audit automatique
  app.use(auditMiddleware);

  // ── Health check ─────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'PDL-145T Backend',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    });
  });

  // ── Routes API ───────────────────────────────────────────────────────────
  app.use('/api/auth', authLimiter, createAuthRoutes(authController));
  app.use('/api/parents', createParentRoutes(parentsController));
  app.use('/api/births', createBirthRoutes(birthsController));
  app.use('/api/geo', createGeoRoutes());
  app.use('/api/dashboard', createDashboardRoutes(dashboardController));

  // ── Middleware d'erreur (doit être en dernier) ────────────────────────────
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

// ── Point d'entrée ────────────────────────────────────────────────────────────
const app = createApp();

app.listen(config.port, () => {
  logger.info(`🚀 PDL-145T Backend démarré sur le port ${config.port}`);
  logger.info(`📊 Environnement : ${config.nodeEnv}`);
  logger.info(`🗄️  Base de données : ${config.db.path}`);
  logger.info(`🌐 CORS autorisé : ${config.cors.allowedOrigins.join(', ')}`);
});

export default app;
// trigger restart
