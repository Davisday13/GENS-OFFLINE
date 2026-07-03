export function definirModelo(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS crm_prospectos (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      email TEXT,
      telefono TEXT,
      empresa TEXT,
      fuente TEXT,
      estado TEXT NOT NULL DEFAULT 'nuevo',
      notas TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS crm_oportunidades (
      id TEXT PRIMARY KEY,
      prospecto_id TEXT REFERENCES crm_prospectos(id),
      titulo TEXT NOT NULL,
      monto_estimado REAL,
      etapa TEXT NOT NULL DEFAULT 'nuevo',
      probabilidad INTEGER NOT NULL DEFAULT 10,
      fecha_cierre_estimada TEXT,
      cliente_id TEXT REFERENCES vta_clientes(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS crm_interacciones (
      id TEXT PRIMARY KEY,
      tipo TEXT NOT NULL,
      prospecto_id TEXT REFERENCES crm_prospectos(id),
      cliente_id TEXT REFERENCES vta_clientes(id),
      descripcion TEXT NOT NULL,
      fecha TEXT NOT NULL,
      usuario_id TEXT REFERENCES core_usuarios(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
