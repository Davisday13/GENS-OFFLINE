import { create } from 'zustand';

const useStore = create((set) => ({
  usuario: null,
  pedidoActivo: null,
  mesaSeleccionada: null,
  vistaActual: 'dashboard',

  setUsuario: (usuario) => set({ usuario }),
  setPedidoActivo: (pedidoActivo) => set({ pedidoActivo }),
  setMesaSeleccionada: (mesaSeleccionada) => set({ mesaSeleccionada }),
  setVistaActual: (vistaActual) => set({ vistaActual }),
}));

export default useStore;
