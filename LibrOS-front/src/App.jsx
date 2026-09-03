import { Routes, Route, NavLink } from 'react-router-dom'
import LibrosPage from './pages/LibrosPage.jsx'
import AutoresPage from './pages/AutoresPage.jsx'
import GenerosPage from './pages/GenerosPage.jsx'

function App() {
  return (
    <>
      <nav>
        <NavLink to="/">Libros</NavLink>
        <NavLink to="/autores">Autores</NavLink>
        <NavLink to="/generos">Generos</NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<LibrosPage />} />
          <Route path="/autores" element={<AutoresPage />} />
          <Route path="/generos" element={<GenerosPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
