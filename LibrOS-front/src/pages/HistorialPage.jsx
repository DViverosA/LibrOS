import { Fragment, useEffect, useState } from 'react'
import { getVentas } from '../api/client'
import { formatoFecha, formatoMoneda, mensajeError } from '../utils'

export default function HistorialPage() {
  const [ventas, setVentas] = useState([])
  const [abierta, setAbierta] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getVentas()
      .then((res) => setVentas(res.data))
      .catch((err) => setError(mensajeError(err, 'No se pudo cargar el historial de ventas.')))
      .finally(() => setCargando(false))
  }, [])

  return (
    <div>
      <div className="header-row">
        <h1>Historial de ventas</h1>
      </div>

      {error && <p className="error">{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Vendedor</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">Aún no hay ventas registradas.</td>
              </tr>
            ) : (
              ventas.map((v) => (
                <Fragment key={v.id}>
                  <tr>
                    <td>{v.id}</td>
                    <td>{formatoFecha(v.fecha)}</td>
                    <td>{v.vendedor}</td>
                    <td>{formatoMoneda(v.total)}</td>
                    <td>
                      <button
                        className="btn-secondary"
                        onClick={() => setAbierta(abierta === v.id ? null : v.id)}
                      >
                        {abierta === v.id ? 'Ocultar' : 'Ver detalle'}
                      </button>
                    </td>
                  </tr>
                  {abierta === v.id &&
                    v.detalles.map((d) => (
                      <tr key={`${v.id}-${d.libroId}`} className="detalle">
                        <td></td>
                        <td colSpan={2}>{d.titulo}</td>
                        <td colSpan={2}>
                          {d.cantidad} × {formatoMoneda(d.precioUnitario)} = {formatoMoneda(d.subtotal)}
                        </td>
                      </tr>
                    ))}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
