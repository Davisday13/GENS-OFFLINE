export function definirModelo(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rec_categorias (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rec_recetas (
      id TEXT PRIMARY KEY,
      codigo TEXT UNIQUE,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      categoria_id TEXT REFERENCES rec_categorias(id),
      rendimiento REAL NOT NULL DEFAULT 1,
      unidad_rendimiento TEXT NOT NULL DEFAULT 'porción',
      instrucciones TEXT,
      costo_insumos REAL NOT NULL DEFAULT 0,
      costo_mano_obra REAL NOT NULL DEFAULT 0,
      costo_total REAL NOT NULL DEFAULT 0,
      precio_sugerido REAL NOT NULL DEFAULT 0,
      activo INTEGER NOT NULL DEFAULT 1,
      imagen_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rec_ingredientes (
      id TEXT PRIMARY KEY,
      receta_id TEXT NOT NULL REFERENCES rec_recetas(id) ON DELETE CASCADE,
      producto_id TEXT NOT NULL REFERENCES inv_productos(id),
      cantidad REAL NOT NULL DEFAULT 0,
      unidad TEXT NOT NULL DEFAULT 'unidad',
      merma_porcentaje REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rec_costos_historicos (
      id TEXT PRIMARY KEY,
      receta_id TEXT NOT NULL REFERENCES rec_recetas(id) ON DELETE CASCADE,
      costo_insumos REAL NOT NULL,
      costo_mano_obra REAL NOT NULL,
      costo_total REAL NOT NULL,
      precio_sugerido REAL NOT NULL,
      observacion TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rec_produccion (
      id TEXT PRIMARY KEY,
      receta_id TEXT NOT NULL REFERENCES rec_recetas(id),
      cantidad REAL NOT NULL,
      fecha TEXT NOT NULL,
      notas TEXT,
      usuario_id TEXT REFERENCES core_usuarios(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pos_producto_receta (
      id TEXT PRIMARY KEY,
      pos_producto_id TEXT NOT NULL REFERENCES pos_productos(id) ON DELETE CASCADE,
      receta_id TEXT NOT NULL REFERENCES rec_recetas(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(pos_producto_id, receta_id)
    );
  `);
}
