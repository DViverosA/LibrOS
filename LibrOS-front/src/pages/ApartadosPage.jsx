import { useEffect, useMemo, useState } from 'react'
import {
  getApartados, crearApartado, entregarApartado, cancelarApartado,
  getClientes, getLibros
} from '../api/client'
import { formatoFecha, mensajeError, refrescarAlertas } from '../utils'

const ESTADOS = ['Pendiente', 'Disponible', 'Entregado', 'Cancelado']
const CLASE_ESTADO = {
  Pendiente: 'badge-ambar',
  Disponible: 'badge-verde',
  Entregado: 'badge-gris',
  Cancelado: 'badge-gris'
}

export default function ApartadosPage() {
  const [apartados, setApartados] = useState([])
  const [clientes, setClientes] = useState([])
  const [libros, setLibros] = useState([])
  const [form, setForm] = useState({ clienteId: '', libroId: '', cantidad: '1' })
  const [filtro, setFiltro] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [cargando, setCargando] = useState(true)

  const cargarApartados = async () => {
    try {
      const res = await getApartados(filtro)
      setApartados(res.data)
    } catch (err) {
      setError(mensajeError(err, 'No se pudo cargar la lista de apartados.'))
    } finally {
      setCargando(false)
    }
  }

  const cargarCatalogos = async () => {
    try {
      const [c, l] = await Promise.all([getClientes(), getLibros()])
      setClientes(c.data)
      setLibros(l.data)
    } catch (err) {
      setError(mensajeError(err, 'No se pudieron cargar clientes y libros.'))
    }
  }

  useEffect(() => { cargarCatalogos() }, [])
  useEffect(() => { cargarApartados() }, [filtro])

  // Solo se pueden apartar libros agotados
  const agotados = useMemo(() => libros.filter((l) => l.cantidad === 0), [libros])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setExito('')

    if (!form.clienteId) { setError('Selecciona un cliente.'); return }
    if (!form.libroId) { setError('Selecciona un libro agotado.'); return }
    if (!Number.isInteger(Number(form.cantidad)) || Number(form.cantidad) < 1) {
      setError('La cantidad debe ser al menos 1.')
      return
    }

    try {
      await crearApartado({
        clienteId: Number(form.clienteId),
        libroId: Number(form.libroId),
        cantidad: Number(form.cantidad)
      })
      setExito('Apartado registrado. Se avisará cuando llegue stock.')
      setForm({ clienteId: '', libroId: '', cantidad: '1' })
      setError('')
      cargarApartados()
      refrescarAlertas()
    } catch (err) {
      setError(mensajeError(err, 'No se pudo registrar el apartado.'))
    }
  }

  const accion = async (fn, id, mensaje) => {
    setExito('')
    try {
      await fn(id)
      setError('')
      setExito(mensaje)
      cargarApartados()
      refrescarAlertas()
    } catch (err) {
      setError(mensajeError(err, 'No se pudo completar la acción.'))
    }
  }

  return (
    <div>
      <div className="header-row">
        <h1>Apartados</h1>
      </div>

      {(clientes.length === 0 || agotados.length === 0) && (
        <p className="muted">
          {clientes.length === 0
            ? 'Primero registra al menos un cliente frecuente. '
            : ''}
          {agotados.length === 0
            ? 'No hay libros agotados por apartar en este momento.'
            : ''}
        </p>
      )}

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <label className="span-2">
          Cliente
          <select
            value={form.clienteId}
            onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
          >
            <option value="">Selecciona un cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </label>
        <label className="span-2">
          Libro agotado
          <select
            value={form.libroId}
            onChange={(e) => setForm({ ...form, libroId: e.target.value })}
          >
            <option value="">Selecciona un libro</option>
            {agotados.map((l) => (
              <option key={l.id} value={l.id}>{l.titulo}</option>
            ))}
          </select>
        </label>
        <label>
          Cantidad
          <input
            type="number"
            min="1"
            step="1"
            value={form.cantidad}
            onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
          />
        </label>
        <div className="actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={clientes.length === 0 || agotados.length === 0}
          >
            Registrar apartado
          </button>
        </div>
      </form>

      {error && <p className="error" role="alert">{error}</p>}
      {exito && <p className="success" role="status">{exito}</p>}

      <div className="toolbar">
        <label className="inline">
          Estado
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todos</option>
            {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Libro</th>
                <th>Cant.</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {apartados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="muted">No hay apartados para mostrar.</td>
                </tr>
              ) : (
                apartados.map((a) => (
                  <tr key={a.id} className={a.estado === 'Disponible' ? 'fila-lista' : ''}>
                    <td>{formatoFecha(a.fecha)}</td>
                    <td>{a.clienteNombre}</td>
                    <td>{[a.clienteTelefono, a.clienteEmail].filter(Boolean).join(' · ') || '-'}</td>
                    <td>{a.libroTitulo}</td>
                    <td>{a.cantidad}</td>
                    <td><span className={`badge ${CLASE_ESTADO[a.estado]}`}>{a.estado}</span></td>
                    <td className="actions">
                      {a.estado === 'Disponible' && (
                        <button
                          className="btn-primary"
                          onClick={() => accion(entregarApartado, a.id, 'Apartado marcado como entregado.')}
                        >
                          Entregar
                        </button>
                      )}
                      {(a.estado === 'Pendiente' || a.estado === 'Disponible') && (
                        <button
                          className="btn-danger"
                          onClick={() => accion(cancelarApartado, a.id, 'Apartado cancelado.')}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}