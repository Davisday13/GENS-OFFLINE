export function definirModelo(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS core_empresas (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      ruc TEXT UNIQUE,
      schema_name TEXT UNIQUE,
      logo_url TEXT,
      config TEXT NOT NULL DEFAULT '{}',
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS core_sucursales (
      id TEXT PRIMARY KEY,
      empresa_id TEXT NOT NULL REFERENCES core_empresas(id),
      nombre TEXT NOT NULL,
      direccion TEXT,
      telefono TEXT,
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS core_roles (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      empresa_id TEXT REFERENCES core_empresas(id),
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS core_permisos (
      id TEXT PRIMARY KEY,
      codigo TEXT UNIQUE NOT NULL,
      nombre TEXT NOT NULL,
      modulo TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS core_roles_permisos (
      id TEXT PRIMARY KEY,
      rol_id TEXT NOT NULL REFERENCES core_roles(id),
      permiso_id TEXT NOT NULL REFERENCES core_permisos(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS core_usuarios (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      nombre TEXT NOT NULL,
      password TEXT NOT NULL,
      rol_id TEXT REFERENCES core_roles(id),
      empresa_id TEXT REFERENCES core_empresas(id),
      sucursal_id TEXT REFERENCES core_sucursales(id),
      telefono TEXT,
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS core_sesiones (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL REFERENCES core_usuarios(id),
      token TEXT UNIQUE NOT NULL,
      expira_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS core_bitacora (
      id TEXT PRIMARY KEY,
      usuario_id TEXT REFERENCES core_usuarios(id),
      accion TEXT NOT NULL,
      entidad TEXT,
      entidad_id TEXT,
      detalle TEXT,
      ip TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS core_notificaciones (
      id TEXT PRIMARY KEY,
      usuario_id TEXT REFERENCES core_usuarios(id),
      tipo TEXT NOT NULL DEFAULT 'in-app',
      titulo TEXT NOT NULL,
      mensaje TEXT NOT NULL,
      leida INTEGER NOT NULL DEFAULT 0,
      modulo_origen TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS core_configuracion (
      id TEXT PRIMARY KEY,
      empresa_id TEXT REFERENCES core_empresas(id),
      clave TEXT NOT NULL,
      valor TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
