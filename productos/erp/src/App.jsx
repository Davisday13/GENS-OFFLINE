import { useState, useEffect } from 'react'
import {
  LayoutDashboard, ShoppingCart, FileText, Users, Package,
  Warehouse, Truck, Building2, UserCircle, Settings,
  Bell, ChevronRight, Menu, X, DollarSign, ClipboardList,
  BarChart3, LogOut, ChefHat, Receipt, TrendingUp, Coffee,
  UtensilsCrossed, ListOrdered, Monitor, Wallet, BookOpen,
  Banknote, QrCode, PieChart, Calendar
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Productos from './pages/Productos'
import Clientes from './pages/Clientes'
import Proveedores from './pages/Proveedores'
import Inventario from './pages/Inventario'
import Bodegas from './pages/Bodegas'
import Facturas from './pages/Facturas'
import Ventas from './pages/Ventas'
import Compras from './pages/Compras'
import Planilla from './pages/Planilla'
import Recetas from './pages/Recetas'
import CierreZ from './pages/CierreZ'
import MenuEngineering from './pages/MenuEngineering'
import Mesas from './pages/Mesas'
import Pedidos from './pages/Pedidos'
import Cocina from './pages/Cocina'
import Caja from './pages/Caja'
import Reportes from './pages/Reportes'
import Asientos from './pages/Asientos'
import Gastos from './pages/Gastos'
import Arqueos from './pages/Arqueos'
import Conciliacion from './pages/Conciliacion'
import QRs from './pages/QRs'
import MenuDigital from './pages/MenuDigital'
import Analytics from './pages/Analytics'

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    section: 'Comercial',
    items: [
      { id: 'ventas', label: 'Ventas', icon: DollarSign },
      { id: 'facturas', label: 'Facturas', icon: FileText },
      { id: 'clientes', label: 'Clientes', icon: Users },
      { id: 'productos', label: 'Productos', icon: Package },
    ],
  },
  {
    section: 'Restaurante',
    items: [
      { id: 'mesas', label: 'Mapa de Mesas', icon: Coffee },
      { id: 'pedidos', label: 'Pedidos', icon: ListOrdered },
      { id: 'cocina', label: 'Cocina KDS', icon: Monitor },
      { id: 'caja', label: 'Caja', icon: Wallet },
      { id: 'cierrez', label: 'Cierres Z/X', icon: Receipt },
    ],
  },
  {
    section: 'Cocina & Recetas',
    items: [
      { id: 'recetas', label: 'Recetas', icon: ChefHat },
      { id: 'menu-engineering', label: 'Menú Engineering', icon: TrendingUp },
      { id: 'menu-digital', label: 'Menú Digital', icon: UtensilsCrossed },
    ],
  },
  {
    section: 'Operaciones',
    items: [
      { id: 'inventario', label: 'Inventario', icon: Warehouse },
      { id: 'bodegas', label: 'Bodegas', icon: Building2 },
      { id: 'compras', label: 'Compras', icon: Truck },
      { id: 'proveedores', label: 'Proveedores', icon: Users },
    ],
  },
  {
    section: 'Contabilidad',
    items: [
      { id: 'asientos', label: 'Asientos', icon: BookOpen },
      { id: 'gastos', label: 'Gastos', icon: Wallet },
      { id: 'arqueos', label: 'Arqueos', icon: Banknote },
      { id: 'conciliacion', label: 'Conciliación', icon: TrendingUp },
    ],
  },
  {
    section: 'Marketing',
    items: [
      { id: 'qrs', label: 'Códigos QR', icon: QrCode },
      { id: 'analytics', label: 'Analytics', icon: PieChart },
    ],
  },
  {
    section: 'RRHH',
    items: [
      { id: 'planilla', label: 'Planilla', icon: ClipboardList },
    ],
  },
  {
    section: 'Reportes',
    items: [
      { id: 'reportes', label: 'Reportes', icon: BarChart3 },
    ],
  },
  { id: 'configuracion', label: 'Configuración', icon: Settings, bottom: true },
]

const breadcrumbMap = {
  dashboard: 'Dashboard',
  ventas: 'Ventas',
  facturas: 'Facturas',
  clientes: 'Clientes',
  productos: 'Productos',
  inventario: 'Inventario',
  bodegas: 'Bodegas',
  compras: 'Compras',
  proveedores: 'Proveedores',
  planilla: 'Planilla',
  recetas: 'Recetas',
  mesas: 'Mapa de Mesas',
  pedidos: 'Pedidos',
  cocina: 'Cocina KDS',
  caja: 'Caja',
  cierrez: 'Cierres Z/X',
  'menu-engineering': 'Menú Engineering',
  'menu-digital': 'Menú Digital',
  asientos: 'Asientos Contables',
  gastos: 'Gastos',
  arqueos: 'Arqueos',
  conciliacion: 'Conciliación',
  qrs: 'Códigos QR',
  analytics: 'Analytics',
  reportes: 'Reportes',
  configuracion: 'Configuración',
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const handler = (e) => setCurrentPage(e.detail)
    window.addEventListener('navigate', handler)
    return () => window.removeEventListener('navigate', handler)
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />
      case 'productos': return <Productos />
      case 'clientes': return <Clientes />
      case 'proveedores': return <Proveedores />
      case 'inventario': return <Inventario />
      case 'bodegas': return <Bodegas />
      case 'facturas': return <Facturas />
      case 'ventas': return <Ventas />
      case 'compras': return <Compras />
      case 'planilla': return <Planilla />
      case 'recetas': return <Recetas />
      case 'mesas': return <Mesas />
      case 'pedidos': return <Pedidos />
      case 'cocina': return <Cocina />
      case 'caja': return <Caja />
      case 'menu-engineering': return <MenuEngineering />
      case 'menu-digital': return <MenuDigital />
      case 'cierrez': return <CierreZ />
      case 'asientos': return <Asientos />
      case 'gastos': return <Gastos />
      case 'arqueos': return <Arqueos />
      case 'conciliacion': return <Conciliacion />
      case 'qrs': return <QRs />
      case 'analytics': return <Analytics />
      case 'reportes': return <Reportes />
      default: return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-brand-navy flex flex-col transition-transform duration-200`}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">GENS ERP</span>
          </div>
          <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <button
            onClick={() => { setCurrentPage('dashboard'); setSidebarOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentPage === 'dashboard' ? 'bg-brand text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          {navigation.filter(n => n.items).map(section => (
            <div key={section.section}>
              <div className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {section.section}
              </div>
              {section.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setCurrentPage(item.id); setSidebarOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentPage === item.id ? 'bg-brand text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
          <button
            onClick={() => { setCurrentPage('configuracion'); setSidebarOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentPage === 'configuracion' ? 'bg-brand text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" />
            Configuración
          </button>
        </nav>
        <div className="p-3 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <nav className="flex items-center gap-1 text-sm text-gray-500">
              <span className="font-medium text-gray-900">{breadcrumbMap[currentPage] || 'Dashboard'}</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white text-xs font-bold">
                AD
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">admin@gens.com</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
