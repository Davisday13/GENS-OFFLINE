export function definirModelo(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rrhh_empleados (
      id TEXT PRIMARY KEY,
      cedula TEXT UNIQUE,
      nombre TEXT NOT NULL,
      email TEXT,
      telefono TEXT,
      direccion TEXT,
      fecha_nacimiento TEXT,
      sexo TEXT,
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rrhh_contratos (
      id TEXT PRIMARY KEY,
      empleado_id TEXT NOT NULL REFERENCES rrhh_empleados(id),
      tipo TEXT NOT NULL,
      cargo TEXT NOT NULL,
      salario_base REAL NOT NULL,
      forma_pago TEXT NOT NULL DEFAULT 'mensual',
      fecha_inicio TEXT NOT NULL,
      fecha_fin TEXT,
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rrhh_asistencia (
      id TEXT PRIMARY KEY,
      empleado_id TEXT NOT NULL REFERENCES rrhh_empleados(id),
      fecha TEXT NOT NULL,
      hora_entrada TEXT,
      hora_salida TEXT,
      tipo TEXT NOT NULL DEFAULT 'normal',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rrhh_vacaciones (
      id TEXT PRIMARY KEY,
      empleado_id TEXT NOT NULL REFERENCES rrhh_empleados(id),
      fecha_inicio TEXT NOT NULL,
      fecha_fin TEXT NOT NULL,
      dias INTEGER NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rrhh_nominas (
      id TEXT PRIMARY KEY,
      empleado_id TEXT REFERENCES rrhh_empleados(id),
      contrato_id TEXT REFERENCES rrhh_contratos(id),
      periodo TEXT NOT NULL,
      salario_base REAL NOT NULL,
      horas_extra REAL NOT NULL DEFAULT 0,
      bonos REAL NOT NULL DEFAULT 0,
      deducciones REAL NOT NULL DEFAULT 0,
      seguro_social REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      pagado INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
