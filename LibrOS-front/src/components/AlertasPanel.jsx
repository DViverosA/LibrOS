import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getAlertas } from '../api/client'

export default function AlertasPanel() {
  const [alertas, setAlertas] = useState(null)
  const { pathname } = useLocation()

  const cargar = useCallback(() => {
    getAlertas().then((res) => setAlertas(res.data)).catch(() => {})
  }, [])

  // Al cambiar de pantalla
  useEffect(() => { cargar() }, [pathname, cargar])

  // Cada 30 s y cuando otra pantalla avisa que algo cambió
  useEffect(() => {
    const t = setInterval(cargar, 30000)
    window.addEventListener('alertas:refrescar', cargar)
    return () => {
      clearInterval(t)
      window.removeEventListener('alertas:refrescar', cargar)
    }
  }, [cargar])

  if (!alertas) return null
  const { apartadosListos, stockBajo } = alertas
  if (apartadosListos.length === 0 && stockBajo.length === 0) return null

  return (
    <section className="alertas" aria-label="Alertas">
      {apartadosListos.length > 0 && (
        <div className="alerta alerta-apartado" role="alert">
          <strong>
            {apartadosListos.length === 1
              ? '1 apartado ya puede atenderse'
              : `${apartadosListos.length} apartados ya pueden atenderse`}
          </strong>
          <ul>
            {apartadosListos.map((a) => (
              <li key={a.id}>
                <b>{a.clienteNombre}</b> espera "{a.libroTitulo}" (x{a.cantidad}).
                Contacto: {[a.clienteTelefono, a.clienteEmail].filter(Boolean).join(' · ')}
              </li>
            ))}
          </ul>
          <Link to="/apartados">Ir a Apartados</Link>
        </div>
      )}

      {stockBajo.length > 0 && (
        <div className="alerta alerta-stock" role="alert">
          <strong>
            {stockBajo.length === 1
                ? '1 libro está por debajo de su stock mínimo'
                : `${stockBajo.length} libros están por debajo de su stock mínimo`}
            </strong>
            <ul>
            {stockBajo.map((l) => (
                <li key={l.libroId}>
                "{l.titulo}": quedan <b>{l.cantidad}</b> (mínimo {l.stockMinimo}). Requiere reabastecimiento.
                </li>
            ))}
            </ul>
          <Link to="/">Ir a Inventario</Link>
        </div>
      )}
    </section>
  )
}