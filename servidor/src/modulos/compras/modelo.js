export function definirModelo(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS com_proveedores (
      id TEXT PRIMARY KEY,
      ruc TEXT UNIQUE,
      nombre TEXT NOT NULL,
      email TEXT,
      telefono TEXT,
      direccion TEXT,
      plazo_pago_dias INTEGER NOT NULL DEFAULT 30,
      activo INTEGER NOT NULL DEFAULT 1,
      calificacion INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS com_solicitudes_compra (
      id TEXT PRIMARY KEY,
      numero TEXT UNIQUE NOT NULL,
      solicitante_id TEXT REFERENCES core_usuarios(id),
      fecha TEXT NOT NULL,
      items TEXT NOT NULL DEFAULT '[]',
      estado TEXT NOT NULL DEFAULT 'pendiente',
      aprobador_id TEXT REFERENCES core_usuarios(id),
      fecha_aprobacion TEXT,
      notas TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS com_ordenes_compra (
      id TEXT PRIMARY KEY,
      numero TEXT UNIQUE NOT NULL,
      proveedor_id TEXT REFERENCES com_proveedores(id),
      solicitud_id TEXT REFERENCES com_solicitudes_compra(id),
      fecha TEXT NOT NULL,
      fecha_estimada TEXT,
      items TEXT NOT NULL DEFAULT '[]',
      subtotal REAL NOT NULL DEFAULT 0,
      itbms REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      estado TEXT NOT NULL DEFAULT 'pendiente',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS com_recepciones (
      id TEXT PRIMARY KEY,
      orden_compra_id TEXT REFERENCES com_ordenes_compra(id),
      fecha TEXT NOT NULL,
      items TEXT NOT NULL DEFAULT '[]',
      bodega_id TEXT REFERENCES inv_bodegas(id),
      usuario_id TEXT REFERENCES core_usuarios(id),
      notas TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
