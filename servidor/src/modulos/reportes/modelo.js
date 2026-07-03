export function definirModelo(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rep_reportes (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      modulo TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'predefinido',
      config TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rep_dashboards (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      usuario_id TEXT REFERENCES core_usuarios(id),
      rol_id TEXT REFERENCES core_roles(id),
      config TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
