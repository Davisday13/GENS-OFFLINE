# GENS-OFFLINE

Ecosistema GENS completo funcionando **100% offline** con Express + SQLite.

## Requisitos

- Node.js 18+
- npm 9+

## Inicio rápido

```bash
# Instalar todo
npm install

# Inicializar BD + seed + arrancar servidor y productos
npm run setup
npm run iniciar
```

## Productos

| Puerto | Producto     | Descripción                       |
|--------|-------------|-----------------------------------|
| 3001   | Servidor    | API Express + SQLite              |
| 3000   | Contabilidad| Sistema contable HOPS             |
| 5173   | POS         | Punto de venta restaurantes       |
| 5174   | ERP         | ERP completo                      |
| 5180   | Engage      | QR dinámicos + menú digital       |

## Estructura

```
GENS-OFFLINE/
├── servidor/          # Backend unificado Express + SQLite
├── productos/         # Aplicaciones frontend
│   ├── contabilidad/
│   ├── pos/
│   ├── erp/
│   └── engage/
├── compartido/        # Módulos reutilizables
│   ├── fe-hka-pa/     # Facturación electrónica offline
│   └── cliente-api/   # Cliente API local (reemplaza Supabase)
├── scripts/           # Utilidades
└── marca/             # Assets visuales
```
