const express = require('express');
const cors = require('cors');
const net = require('net');

let SerialPort;
try {
  SerialPort = require('serialport').SerialPort;
} catch (e) {
  console.warn('[gens-print] serialport no disponible. Bluetooth/COM deshabilitado.');
}

const app = express();
const PORT = process.env.GENS_AGENT_PORT || 9911;

app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '2mb' }));

app.get('/ping', (req, res) => {
  res.json({
    ok: true,
    agente: 'gens-print',
    version: '1.0.0',
    serial_disponible: !!SerialPort,
  });
});

app.get('/impresoras', async (req, res) => {
  if (!SerialPort) return res.json({ puertos: [] });
  try {
    const lista = await SerialPort.list();
    res.json({
      puertos: lista.map((p) => ({
        path: p.path,
        manufacturer: p.manufacturer || null,
        friendlyName: p.friendlyName || null,
        pnpId: p.pnpId || null,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: 'No se pudo listar puertos: ' + e.message });
  }
});

app.post('/imprimir', async (req, res) => {
  const { tipo, host, puerto, com, baudRate, comandos } = req.body || {};

  if (!comandos || typeof comandos !== 'string') {
    return res.status(400).json({ error: 'Falta campo "comandos" en base64.' });
  }

  let buffer;
  try {
    buffer = Buffer.from(comandos, 'base64');
    if (buffer.length === 0) throw new Error('Buffer vacío');
  } catch (e) {
    return res.status(400).json({ error: 'comandos no es base64 válido: ' + e.message });
  }

  try {
    if (tipo === 'IP') {
      if (!host) return res.status(400).json({ error: 'Falta "host" para impresora IP.' });
      await imprimirTcp(host, Number(puerto) || 9100, buffer);
      return res.json({ ok: true, bytes: buffer.length, modo: `IP ${host}:${puerto || 9100}` });
    }

    if (tipo === 'SERIAL') {
      if (!SerialPort) return res.status(503).json({ error: 'Serialport no disponible en este agente.' });
      if (!com) return res.status(400).json({ error: 'Falta "com" para impresora SERIAL.' });
      await imprimirSerial(com, Number(baudRate) || 9600, buffer);
      return res.json({ ok: true, bytes: buffer.length, modo: `SERIAL ${com}@${baudRate || 9600}` });
    }

    return res.status(400).json({ error: 'tipo inválido. Use "IP" o "SERIAL".' });
  } catch (e) {
    console.error('[gens-print] Error:', e.message);
    return res.status(500).json({ error: e.message });
  }
});

function imprimirTcp(host, puerto, buffer) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let resuelto = false;

    const timeout = setTimeout(() => {
      if (resuelto) return;
      resuelto = true;
      socket.destroy();
      reject(new Error(`Timeout conectando a ${host}:${puerto}`));
    }, 5000);

    socket.connect(puerto, host, () => {
      socket.write(buffer, (err) => {
        if (err) {
          if (resuelto) return;
          resuelto = true;
          clearTimeout(timeout);
          socket.destroy();
          return reject(err);
        }
        setTimeout(() => { socket.end(); }, 300);
      });
    });

    socket.on('close', () => {
      if (resuelto) return;
      resuelto = true;
      clearTimeout(timeout);
      resolve();
    });

    socket.on('error', (err) => {
      if (resuelto) return;
      resuelto = true;
      clearTimeout(timeout);
      socket.destroy();
      reject(new Error(`Error TCP ${host}:${puerto} - ${err.message}`));
    });
  });
}

function imprimirSerial(com, baudRate, buffer) {
  return new Promise((resolve, reject) => {
    const port = new SerialPort({ path: com, baudRate, autoOpen: false });
    let resuelto = false;

    const timeout = setTimeout(() => {
      if (resuelto) return;
      resuelto = true;
      try { port.close(); } catch {}
      reject(new Error(`Timeout escribiendo a ${com}`));
    }, 8000);

    port.open((err) => {
      if (err) {
        if (resuelto) return;
        resuelto = true;
        clearTimeout(timeout);
        return reject(new Error(`No se pudo abrir ${com}: ${err.message}`));
      }
      port.write(buffer, (writeErr) => {
        if (writeErr) {
          if (resuelto) return;
          resuelto = true;
          clearTimeout(timeout);
          try { port.close(); } catch {}
          return reject(writeErr);
        }
        port.drain((drainErr) => {
          if (resuelto) return;
          resuelto = true;
          clearTimeout(timeout);
          if (drainErr) {
            try { port.close(); } catch {}
            return reject(drainErr);
          }
          setTimeout(() => { port.close(() => resolve()); }, 300);
        });
      });
    });
  });
}

app.listen(PORT, '127.0.0.1', () => {
  console.log('==================================================');
  console.log('  GENS PRINT AGENT v1.0.0');
  console.log(`  Escuchando en http://localhost:${PORT}`);
  console.log(`  Serial:    ${SerialPort ? 'disponible' : 'NO DISPONIBLE'}`);
  console.log('==================================================');
  console.log('Endpoints:');
  console.log(`  GET  http://localhost:${PORT}/ping`);
  console.log(`  GET  http://localhost:${PORT}/impresoras`);
  console.log(`  POST http://localhost:${PORT}/imprimir`);
  console.log('==================================================');
});
