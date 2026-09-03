import { useEffect, useState } from 'react'
import { getGeneros, crearGenero, actualizarGenero, eliminarGenero } from '../api/client'

const vacio = { nombre: '' }

export default function GenerosPage() {
  const [generos, setGeneros] = useState([])
  const [form, setForm] = useState(vacio)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  const cargar = async () => {
    setCargando(true)
    try {
      const res = await getGeneros()
      setGeneros(res.data)
      setError('')
    } catch (err) {
      setError('No se pudo cargar la lista de géneros. Revisa que la API esté corriendo.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await actualizarGenero(editId, form)
      } else {
        await crearGenero(form)
      }
      setForm(vacio)
      setEditId(null)
      cargar()
    } catch (err) {
      setError('Error al guardar el género.')
    }
  }

  const handleEditar = (genero) => {
    setEditId(genero.id)
    setForm({ nombre: genero.nombre })
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este género?')) return
    try {
      await eliminarGenero(id)
      cargar()
    } catch (err) {
      setError('No se pudo eliminar (puede tener libros asociados).')
    }
  }

  return (
    <div>
      <div className="header-row">
        <h1>Géneros</h1>
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {generos.map((g) => (
              <tr key={g.id}>
                <td>{g.id}</td>
                <td>{g.nombre}</td>
                <td className="actions">
                  <button className="btn-secondary" onClick={() => handleEditar(g)}>Editar</button>
                  <button className="btn-danger" onClick={() => handleEliminar(g.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
