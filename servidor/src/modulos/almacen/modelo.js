export function definirModelo(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS alm_ubicaciones (
      id TEXT PRIMARY KEY,
      bodega_id TEXT NOT NULL REFERENCES inv_bodegas(id),
      codigo TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'estante',
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS alm_recepciones (
      id TEXT PRIMARY KEY,
      oc_id TEXT REFERENCES com_ordenes_compra(id),
      fecha TEXT NOT NULL,
      items_recibidos TEXT NOT NULL DEFAULT '[]',
      usuario_id TEXT REFERENCES core_usuarios(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS alm_despachos (
      id TEXT PRIMARY KEY,
      ov_id TEXT REFERENCES vta_ordenes_venta(id),
      fecha TEXT NOT NULL,
      items_despachados TEXT NOT NULL DEFAULT '[]',
      usuario_id TEXT REFERENCES core_usuarios(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS alm_conteos_fisicos (
      id TEXT PRIMARY KEY,
      bodega_id TEXT NOT NULL REFERENCES inv_bodegas(id),
      fecha TEXT NOT NULL,
      items_conteo TEXT NOT NULL DEFAULT '[]',
      usuario_id TEXT REFERENCES core_usuarios(id),
      ajustado INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
