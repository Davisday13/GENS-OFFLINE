import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, getDb, runMigrations, seedData } from './database.js';
import routesAuth from './routes/auth.js';
import routesContabilidad from './routes/contabilidad.js';
import routesPos from './routes/pos.js';
import routesErp from './routes/erp.js';
import routesEngage from './routes/engage.js';
import routesMotorFiscal from './routes/motor-fiscal.js';
import coreRoutes from './modulos/core/rutas.js';
import inventarioRoutes from './modulos/inventario/rutas.js';
import ventasRoutes from './modulos/ventas/rutas.js';
import comprasRoutes from './modulos/compras/rutas.js';
import finanzasRoutes from './modulos/finanzas/rutas.js';
import rrhhRoutes from './modulos/rrhh/rutas.js';
import crmRoutes from './modulos/crm/rutas.js';
import almacenRoutes from './modulos/almacen/rutas.js';
import reportesRoutes from './modulos/reportes/rutas.js';
import recetasRoutes from './modulos/recetas/rutas.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const app = express();

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
const corsOrigins = process.env.GENS_CORS_ORIGINS ? process.env.GENS_CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5180', 'http://localhost:3000'];
app.use(cors({ origin: IS_PRODUCTION ? corsOrigins : '*', methods: ['GET','POST','PUT','DELETE','PATCH'], allowedHeaders: ['Content-Type','Authorization'], maxAge: 86400 }));
app.use(hpp());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 1000, message: { error: 'Demasiadas solicitudes' } }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', proyecto: 'GENS-OFFLINE', version: '1.0.0' }));
app.get('/api/debug', (req, res) => {
  try {
    const d = getDb();
    if (!d) return res.json({ db: 'not initialized' });
    const tables = d.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    const mesas = d.prepare('SELECT COUNT(*) as c FROM pos_mesas').get();
    const cats = d.prepare('SELECT COUNT(*) as c FROM pos_categorias').get();
    const prods = d.prepare('SELECT COUNT(*) as c FROM pos_productos').get();
    const peds = d.prepare('SELECT COUNT(*) as c FROM pos_pedidos').get();
    res.json({ tables: tables.map(t=>t.name), counts: { mesas: mesas?.c||0, categorias: cats?.c||0, productos: prods?.c||0, pedidos: peds?.c||0 }, node: process.version, env: process.env.NODE_ENV||'dev' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.use('/api/auth', routesAuth);
app.use('/api/contabilidad', routesContabilidad);
app.use('/api/pos', routesPos);
app.use('/api/erp', routesErp);
app.use('/api/engage', routesEngage);
app.use('/api/motor-fiscal', routesMotorFiscal);
app.use('/api/core', coreRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/finanzas', finanzasRoutes);
app.use('/api/rrhh', rrhhRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/almacen', almacenRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/recetas', recetasRoutes);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
const frontendDist = path.join(__dirname, '..', '..', 'productos', 'erp', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'));
});
app.use((err, req, res, next) => {
  const id = crypto.randomUUID?.() || Date.now().toString(36);
  console.error(`[${id}]`, err.message);
  res.status(err.status||500).json({ error: IS_PRODUCTION?'Error interno':err.message, id });
});

try {
  initDb();
  runMigrations();
  seedData();
} catch (e) {
  console.error('Init error:', e.message);
}

export default app;
