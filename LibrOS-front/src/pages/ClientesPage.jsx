import { useEffect, useState } from 'react'
import {
  getClientes, crearCliente, actualizarCliente, eliminarCliente, getHistorialCliente
} from '../api/client'
import { formatoFecha, formatoMoneda, mensajeError } from '../utils'

const vacio = { nombre: '', telefono: '', email: '' }

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState(vacio)
  const [editId, setEditId] = useState(null)
  const [buscar, setBuscar] = useState('')
  const [historial, setHistorial] = useState(null)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [cargando, setCargando] = useState(true)

  const cargar = async () => {
    try {
      const res = await getClientes(buscar.trim())
      setClientes(res.data)
    } catch (err) {
      setError(mensajeError(err, 'No se pudo cargar la lista de clientes.'))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(cargar, 300)
    return () => clearTimeout(t)
  }, [buscar])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setExito('')

    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return }
    if (!form.telefono.trim()) { setError('El teléfono es obligatorio.'); return }
    if (!form.email.trim()) { setError('El correo electrónico es obligatorio.'); return }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) { setError('El correo no tiene un formato válido.'); return }

    const payload = {
     nombre: form.nombre.trim(),
     telefono: form.telefono.trim(),
     email: form.email.trim()
    }

    try {
      if (editId) {
        await actualizarCliente(editId, payload)
        setExito('Cliente actualizado correctamente.')
      } else {
        const res = await crearCliente(payload)
        setExito(`Cliente registrado correctamente con ID ${res.data.id}.`)
      }
      setForm(vacio)
      setEditId(null)
      setError('')
      cargar()
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar el cliente.'))
    }
  }

  const handleEditar = (c) => {
    setEditId(c.id)
    setError('')
    setExito('')
    setForm({ nombre: c.nombre, telefono: c.telefono ?? '', email: c.email ?? '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return
    setExito('')
    try {
      await eliminarCliente(id)
      if (historial?.cliente.id === id) setHistorial(null)
      setError('')
      cargar()
    } catch (err) {
      setError(mensajeError(err, 'No se pudo eliminar el cliente.'))
    }
  }

  const verHistorial = async (id) => {
    try {
      const res = await getHistorialCliente(id)
      setHistorial(res.data)
      setError('')
    } catch (err) {
      setError(mensajeError(err, 'No se pudo cargar el historial del cliente.'))
    }
  }

  return (
    <div>
      <div className="header-row">
        <h1>Clientes frecuentes</h1>
      </div>

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <label className="span-2">
          Nombre
          <input
            value={form.nombre}
            maxLength={150}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
        </label>
        <label>
          Teléfono
          <input
            value={form.telefono}
            maxLength={30}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />
        </label>
        <label>
          Correo
          <input
            type="email"
            value={form.email}
            maxLength={150}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <div className="actions">
          <button type="submit" className="btn-primary">Guardar</button>
          {editId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setEditId(null); setForm(vacio); setError('') }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {error && <p className="error" role="alert">{error}</p>}
      {exito && <p className="success" role="status">{exito}</p>}

      <div className="toolbar">
        <input
          type="search"
          placeholder="Buscar por nombre, teléfono o correo..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
                <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Registro</th>
                <th></th>
                </tr>
            </thead>
            <tbody>
                {clientes.length === 0 ? (
                <tr>
                    <td colSpan={6} className="muted">
                    {buscar.trim() ? 'No se encontraron clientes.' : 'Aún no hay clientes registrados.'}
                    </td>
                </tr>
                ) : (
                clientes.map((c) => (
                    <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.nombre}</td>
                    <td>{c.telefono || '-'}</td>
                    <td>{c.email || '-'}</td>
                    <td>{formatoFecha(c.fechaRegistro)}</td>
                    <td className="actions">
                        <button className="btn-secondary" onClick={() => verHistorial(c.id)}>Historial</button>
                        <button className="btn-secondary" onClick={() => handleEditar(c)}>Editar</button>
                        <button className="btn-danger" onClick={() => handleEliminar(c.id)}>Eliminar</button>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      )}

      {historial && (
        <div className="panel" style={{ marginTop: '1.5rem' }}>
          <div className="header-row">
            <h2>Historial de {historial.cliente.nombre}</h2>
            <button className="btn-secondary" onClick={() => setHistorial(null)}>Cerrar</button>
          </div>
          <p>
            {historial.numeroCompras} compra(s) · Total gastado: <b>{formatoMoneda(historial.totalGastado)}</b>
          </p>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Libros</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {historial.ventas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="muted">Este cliente aún no tiene compras.</td>
                  </tr>
                ) : (
                  historial.ventas.map((v) => (
                    <tr key={v.id}>
                      <td>{v.id}</td>
                      <td>{formatoFecha(v.fecha)}</td>
                      <td>{v.detalles.map((d) => `${d.titulo} (x${d.cantidad})`).join(', ')}</td>
                      <td>{formatoMoneda(v.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}