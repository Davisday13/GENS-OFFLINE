export function definirModelo(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS fin_plan_cuentas (
      id TEXT PRIMARY KEY,
      codigo TEXT NOT NULL,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL,
      nivel INTEGER NOT NULL DEFAULT 1,
      padre_id TEXT REFERENCES fin_plan_cuentas(id),
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS fin_asientos (
      id TEXT PRIMARY KEY,
      numero TEXT UNIQUE NOT NULL,
      fecha TEXT NOT NULL,
      tipo TEXT NOT NULL,
      referencia TEXT,
      descripcion TEXT NOT NULL,
      usuario_id TEXT REFERENCES core_usuarios(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS fin_asientos_detalle (
      id TEXT PRIMARY KEY,
      asiento_id TEXT NOT NULL REFERENCES fin_asientos(id),
      cuenta_id TEXT NOT NULL REFERENCES fin_plan_cuentas(id),
      debe REAL NOT NULL DEFAULT 0,
      haber REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS fin_cxc (
      id TEXT PRIMARY KEY,
      factura_id TEXT REFERENCES vta_facturas(id),
      cliente_id TEXT REFERENCES vta_clientes(id),
      monto REAL NOT NULL,
      saldo REAL NOT NULL,
      fecha_emision TEXT NOT NULL,
      fecha_vencimiento TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS fin_cxp (
      id TEXT PRIMARY KEY,
      oc_id TEXT REFERENCES com_ordenes_compra(id),
      proveedor_id TEXT REFERENCES com_proveedores(id),
      monto REAL NOT NULL,
      saldo REAL NOT NULL,
      fecha_emision TEXT NOT NULL,
      fecha_vencimiento TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS fin_movimientos_bancarios (
      id TEXT PRIMARY KEY,
      fecha TEXT NOT NULL,
      tipo TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      monto REAL NOT NULL,
      referencia TEXT,
      conciliado INTEGER NOT NULL DEFAULT 0,
      cuenta_bancaria TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
