export function definirModelo(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS inv_productos (
      id TEXT PRIMARY KEY,
      codigo TEXT UNIQUE,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      categoria TEXT,
      unidad TEXT NOT NULL DEFAULT 'unidad',
      precio_venta REAL NOT NULL DEFAULT 0,
      costo REAL NOT NULL DEFAULT 0,
      metodo_valuacion TEXT NOT NULL DEFAULT 'promedio',
      stock_minimo REAL NOT NULL DEFAULT 0,
      stock_maximo REAL NOT NULL DEFAULT 0,
      activo INTEGER NOT NULL DEFAULT 1,
      imagen_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS inv_bodegas (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      sucursal_id TEXT REFERENCES core_sucursales(id),
      ubicacion TEXT,
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS inv_existencias (
      id TEXT PRIMARY KEY,
      producto_id TEXT NOT NULL REFERENCES inv_productos(id),
      bodega_id TEXT NOT NULL REFERENCES inv_bodegas(id),
      cantidad REAL NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(producto_id, bodega_id)
    );

    CREATE TABLE IF NOT EXISTS inv_movimientos (
      id TEXT PRIMARY KEY,
      tipo TEXT NOT NULL,
      producto_id TEXT NOT NULL REFERENCES inv_productos(id),
      bodega_id TEXT REFERENCES inv_bodegas(id),
      bodega_destino_id TEXT REFERENCES inv_bodegas(id),
      cantidad REAL NOT NULL,
      costo_unitario REAL,
      referencia TEXT,
      usuario_id TEXT REFERENCES core_usuarios(id),
      notas TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS inv_lotes (
      id TEXT PRIMARY KEY,
      producto_id TEXT NOT NULL REFERENCES inv_productos(id),
      codigo_lote TEXT NOT NULL,
      fecha_vencimiento TEXT,
      cantidad_inicial REAL NOT NULL,
      cantidad_actual REAL NOT NULL,
      bodega_id TEXT REFERENCES inv_bodegas(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
