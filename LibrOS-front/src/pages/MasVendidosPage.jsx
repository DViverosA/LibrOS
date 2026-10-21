import { useEffect, useState } from 'react'
import { getMasVendidos } from '../api/client'
import { formatoMoneda, mensajeError } from '../utils'

const estadoStock = (d) => {
  if (d.stockActual === 0) {
    return { texto: 'Agotado: reabastecer ya', clase: 'badge-rojo' }
  }
  if (d.stockMinimo > 0 && d.stockActual < d.stockMinimo) {
    return { texto: 'Stock bajo: reabastecer', clase: 'badge-ambar' }
  }
  return { texto: 'Stock suficiente', clase: 'badge-verde' }
}

export default function MasVendidosPage() {
  const [datos, setDatos] = useState([])
  const [top, setTop] = useState('10')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    setCargando(true)
    getMasVendidos({ top, desde, hasta })
      .then((res) => { setDatos(res.data); setError('') })
      .catch((err) => setError(mensajeError(err, 'No se pudo cargar el reporte.')))
      .finally(() => setCargando(false))
  }, [top, desde, hasta])

  return (
    <div>
      <div className="header-row">
        <h1>Libros más vendidos</h1>
      </div>

      <div className="toolbar">
        <label className="inline">
          Mostrar
          <select value={top} onChange={(e) => setTop(e.target.value)}>
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="50">Top 50</option>
          </select>
        </label>
        <label className="inline">
          Desde
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </label>
        <label className="inline">
          Hasta
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </label>
        {(desde || hasta) && (
          <button className="btn-secondary" onClick={() => { setDesde(''); setHasta('') }}>
            Limpiar fechas
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Título</th>
                <th>ISBN</th>
                <th>Unidades vendidas</th>
                <th>Ingresos</th>
                <th>Stock actual</th>
                <th>Reabastecimiento</th>
              </tr>
            </thead>
            <tbody>
              {datos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="muted">No hay ventas en el periodo seleccionado.</td>
                </tr>
              ) : (
                datos.map((d, i) => {
                  const est = estadoStock(d)
                  return (
                    <tr key={d.libroId}>
                      <td>{i + 1}</td>
                      <td>{d.titulo}</td>
                      <td>{d.isbn || '-'}</td>
                      <td>{d.unidadesVendidas}</td>
                      <td>{formatoMoneda(d.ingresos)}</td>
                      <td>{d.stockActual}</td>
                      <td><span className={`badge ${est.clase}`}>{est.texto}</span></td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}