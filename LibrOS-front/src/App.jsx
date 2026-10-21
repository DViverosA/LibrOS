import { Routes, Route, NavLink } from 'react-router-dom'
import LibrosPage from './pages/LibrosPage.jsx'
import AutoresPage from './pages/AutoresPage.jsx'
import GenerosPage from './pages/GenerosPage.jsx'
import VentasPage from './pages/VentasPage.jsx'
import HistorialPage from './pages/HistorialPage.jsx'
import MasVendidosPage from './pages/MasVendidosPage.jsx'
import ClientesPage from './pages/ClientesPage.jsx'
import ApartadosPage from './pages/ApartadosPage.jsx'
import AlertasPanel from './components/AlertasPanel.jsx'

function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">LibrOS</div>
        <nav aria-label="Navegación principal">
          <NavLink to="/">Inventario</NavLink>
          <NavLink to="/autores">Autores</NavLink>
          <NavLink to="/generos">Géneros</NavLink>
          <NavLink to="/ventas">Nueva venta</NavLink>
          <NavLink to="/historial">Historial</NavLink>
          <NavLink to="/mas-vendidos">Más vendidos</NavLink>
          <NavLink to="/clientes">Clientes</NavLink>
          <NavLink to="/apartados">Apartados</NavLink>
        </nav>
      </aside>
      <main>
        <AlertasPanel />
        <Routes>
          <Route path="/" element={<LibrosPage />} />
          <Route path="/autores" element={<AutoresPage />} />
          <Route path="/generos" element={<GenerosPage />} />
          <Route path="/ventas" element={<VentasPage />} />
          <Route path="/historial" element={<HistorialPage />} />
          <Route path="/mas-vendidos" element={<MasVendidosPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/apartados" element={<ApartadosPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App