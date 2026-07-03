import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { runMigrations, seedData } from './database.js';
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

runMigrations();
seedData();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', proyecto: 'GENS-OFFLINE', version: '1.0.0' });
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

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GENS Servidor offline corriendo en http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
