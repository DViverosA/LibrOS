import { useEffect, useState } from 'react'
import { getAutores, crearAutor, actualizarAutor, eliminarAutor } from '../api/client'

const vacio = { nombre: '', nacionalidad: '' }

export default function AutoresPage() {
  const [autores, setAutores] = useState([])
  const [form, setForm] = useState(vacio)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  const cargar = async () => {
    setCargando(true)
    try {
      const res = await getAutores()
      setAutores(res.data)
      setError('')
    } catch (err) {
      setError('No se pudo cargar la lista de autores. Revisa que la API esté corriendo.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { nombre: form.nombre, nacionalidad: form.nacionalidad || null }
      if (editId) {
        await actualizarAutor(editId, payload)
      } else {
        await crearAutor(payload)
      }
      setForm(vacio)
      setEditId(null)
      cargar()
    } catch (err) {
      setError('Error al guardar el autor.')
    }
  }

  const handleEditar = (autor) => {
    setEditId(autor.id)
    setForm({ nombre: autor.nombre, nacionalidad: autor.nacionalidad || '' })
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este autor?')) return
    try {
      await eliminarAutor(id)
      cargar()
    } catch (err) {
      setError('No se pudo eliminar (puede tener libros asociados).')
    }
  }

  return (
    <div>
      <div className="header-row">
        <h1>Autores</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          Nombre
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
        </label>
        <label>
          Nacionalidad
          <input
            value={form.nacionalidad}
            onChange={(e) => setForm({ ...form, nacionalidad: e.target.value })}
          />
        </label>
        <div className="actions">
          <button type="submit" className="btn-primary">
            {editId ? 'Actualizar' : 'Agregar'}
          </button>
          {editId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setEditId(null); setForm(vacio) }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {error && <p className="error">{error}</p>}
      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Nombre</th>
              <th>Nacionalidad</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {autores.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.nombre}</td>
                <td>{a.nacionalidad || '-'}</td>
                <td className="actions">
                  <button className="btn-secondary" onClick={() => handleEditar(a)}>Editar</button>
                  <button className="btn-danger" onClick={() => handleEliminar(a.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
