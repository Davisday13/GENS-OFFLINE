export function definirModelo(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS vta_clientes (
      id TEXT PRIMARY KEY,
      ruc TEXT UNIQUE,
      dv TEXT,
      nombre TEXT NOT NULL,
      email TEXT,
      telefono TEXT,
      direccion TEXT,
      credito_limite REAL NOT NULL DEFAULT 0,
      credito_disponible REAL NOT NULL DEFAULT 0,
      tipo TEXT NOT NULL DEFAULT 'contribuyente',
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vta_cotizaciones (
      id TEXT PRIMARY KEY,
      numero TEXT UNIQUE NOT NULL,
      cliente_id TEXT REFERENCES vta_clientes(id),
      fecha TEXT NOT NULL,
      valida_hasta TEXT,
      items TEXT NOT NULL DEFAULT '[]',
      subtotal REAL NOT NULL DEFAULT 0,
      descuento REAL NOT NULL DEFAULT 0,
      itbms REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      estado TEXT NOT NULL DEFAULT 'activa',
      notas TEXT,
      usuario_id TEXT REFERENCES core_usuarios(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vta_ordenes_venta (
      id TEXT PRIMARY KEY,
      numero TEXT UNIQUE NOT NULL,
      cliente_id TEXT REFERENCES vta_clientes(id),
      cotizacion_id TEXT REFERENCES vta_cotizaciones(id),
      fecha TEXT NOT NULL,
      items TEXT NOT NULL DEFAULT '[]',
      subtotal REAL NOT NULL DEFAULT 0,
      descuento REAL NOT NULL DEFAULT 0,
      itbms REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      estado TEXT NOT NULL DEFAULT 'pendiente',
      metodo_pago TEXT,
      vendedor_id TEXT REFERENCES core_usuarios(id),
      notas TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vta_facturas (
      id TEXT PRIMARY KEY,
      numero TEXT UNIQUE NOT NULL,
      orden_venta_id TEXT REFERENCES vta_ordenes_venta(id),
      cliente_id TEXT REFERENCES vta_clientes(id),
      fecha TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'factura',
      subtotal REAL NOT NULL DEFAULT 0,
      itbms REAL NOT NULL DEFAULT 0,
      descuento REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      estado TEXT NOT NULL DEFAULT 'pendiente',
      cufe TEXT,
      items TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vta_comisiones (
      id TEXT PRIMARY KEY,
      orden_venta_id TEXT REFERENCES vta_ordenes_venta(id),
      vendedor_id TEXT REFERENCES core_usuarios(id),
      porcentaje REAL NOT NULL,
      monto REAL NOT NULL,
      pagada INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
