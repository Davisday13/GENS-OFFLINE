import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAÍZ = path.resolve(__dirname, '..');

const PRODUCTOS = [
  { nombre: 'Contabilidad', cwd: path.join(RAÍZ, 'productos', 'contabilidad'), comando: 'npx', args: ['vite', '--host', '0.0.0.0', '--port', '3000'] },
  { nombre: 'POS',          cwd: path.join(RAÍZ, 'productos', 'pos'),          comando: 'npx', args: ['vite', '--port', '5173'] },
  { nombre: 'ERP',          cwd: path.join(RAÍZ, 'productos', 'erp'),          comando: 'npx', args: ['vite', '--port', '5174'] },
  { nombre: 'Engage',       cwd: path.join(RAÍZ, 'productos', 'engage'),       comando: 'npx', args: ['vite', '--port', '5180'] },
  { nombre: 'Motor-Fiscal', cwd: path.join(RAÍZ, 'productos', 'motor-fiscal'),  comando: 'npx', args: ['serve', '.', '-p', '3005'] },
];

let children = [];

function iniciarServidor() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['src/index.js'], {
      cwd: path.join(RAÍZ, 'servidor'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (data) => {
      const msg = data.toString();
      process.stdout.write(`[Servidor] ${msg}`);
      if (msg.includes('corriendo')) resolve(child);
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(`[Servidor ERR] ${data}`);
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Servidor terminó con código ${code}`));
    });

    children.push(child);
  });
}

function iniciarProducto({ nombre, cwd, comando, args }) {
  return new Promise((resolve, reject) => {
    const child = spawn(comando, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    child.stdout.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('Local:')) {
        process.stdout.write(`[${nombre}] ${msg}`);
        resolve(child);
      }
    });

    child.stderr.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('Local:')) {
        process.stdout.write(`[${nombre}] ${msg}`);
        resolve(child);
      }
      process.stderr.write(`[${nombre}] ${msg}`);
    });

    child.on('error', (err) => {
      console.error(`[${nombre}] Error al iniciar:`, err.message);
      resolve(null);
    });

    child.on('exit', (code) => {
      if (code !== 0) console.error(`[${nombre}] Terminó con código ${code}`);
    });

    children.push(child);
  });
}

async function hacerSeed() {
  console.log('\n=== Ejecutando seed de base de datos ===\n');
  try {
    execSync('node src/seed.js', { cwd: path.join(RAÍZ, 'servidor'), stdio: 'inherit' });
  } catch (e) {
    console.log('Seed ya ejecutado o error (no crítico).');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const soloSetup = args.includes('--setup');

  console.log('╔══════════════════════════════════════════╗');
  console.log('║     GENS-OFFLINE · Inicio del sistema    ║');
  console.log('╚══════════════════════════════════════════╝\n');

  if (!fs.existsSync(path.join(RAÍZ, 'servidor', 'data', 'gens.db'))) {
    await hacerSeed();
  }

  if (soloSetup) {
    console.log('\nSetup completado. Ejecuta "npm run iniciar" para arrancar.');
    process.exit(0);
  }

  console.log('\n=== Iniciando Servidor API (Express + SQLite) ===\n');
  try {
    await iniciarServidor();
  } catch (e) {
    console.error('Error fatal al iniciar servidor:', e);
    process.exit(1);
  }

  console.log('\n=== Iniciando productos ===\n');
  const resultados = await Promise.allSettled(PRODUCTOS.map(p => iniciarProducto(p)));

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║  GENS-OFFLINE iniciado correctamente     ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  Servidor:  http://localhost:3001         ║');
  console.log('║  Contabilidad: http://localhost:3000      ║');
  console.log('║  POS:        http://localhost:5173        ║');
  console.log('║  ERP:        http://localhost:5174        ║');
  console.log('║  Engage:     http://localhost:5180        ║');
  console.log('║  Motor-Fiscal: http://localhost:3005      ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  Credenciales: admin@gens.local / admin123║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('\nPresiona Ctrl+C para detener todo.\n');

  process.on('SIGINT', () => {
    console.log('\nDeteniendo todos los procesos...');
    children.forEach(child => {
      try { child.kill(); } catch (e) { /* ignora */ }
    });
    process.exit(0);
  });
}

main().catch(console.error);
