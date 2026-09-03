import { useEffect, useState } from 'react'
import {
  getLibros, crearLibro, actualizarLibro, eliminarLibro,
  getAutores, getGeneros
} from '../api/client'

const vacio = { titulo: '', anioPublicacion: '', precio: '', autorId: '', generoId: '' }

export default function LibrosPage() {
  const [libros, setLibros] = useState([])
  const [autores, setAutores] = useState([])
  const [generos, setGeneros] = useState([])
  const [form, setForm] = useState(vacio)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  const cargarTodo = async () => {
    setCargando(true)
    try {
      const [resLibros, resAutores, resGeneros] = await Promise.all([
        getLibros(), getAutores(), getGeneros()
      ])
      setLibros(resLibros.data)
      setAutores(resAutores.data)
      setGeneros(resGeneros.data)
      setError('')
    } catch (err) {
      setError('No se pudo cargar la información. Revisa que la API esté corriendo y que existan autores y géneros.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargarTodo() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        titulo: form.titulo,
        anioPublicacion: form.anioPublicacion ? Number(form.anioPublicacion) : null,
        precio: form.precio ? Number(form.precio) : null,
        autorId: Number(form.autorId),
        generoId: Number(form.generoId)
      }
      if (editId) {
        await actualizarLibro(editId, payload)
      } else {
        await crearLibro(payload)
      }
      setForm(vacio)
      setEditId(null)
      cargarTodo()
    } catch (err) {
      setError('Error al guardar el libro. Verifica los datos.')
    }
  }

  const handleEditar = (libro) => {
    setEditId(libro.id)
    setForm({
      titulo: libro.titulo,
      anioPublicacion: libro.anioPublicacion ?? '',
      precio: libro.precio ?? '',
      autorId: libro.autorId,
      generoId: libro.generoId
    })
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este libro?')) return
    try {
      await eliminarLibro(id)
      cargarTodo()
    } catch (err) {
      setError('No se pudo eliminar el libro.')
    }
  }

  const sinCatalogos = !cargando && (autores.length === 0 || generos.length === 0)

  return (
    <div>
      <div className="header-row">
        <h1>Libros</h1>
      </div>

      {sinCatalogos && (
        <p className="error">
          Necesitas al menos un Autor y un Género antes de poder agregar libros.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label>
          Título
          <input
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            required
          />
        </label>
        <label>
          Año de publicación
          <input
            type="number"
            value={form.anioPublicacion}
            onChange={(e) => setForm({ ...form, anioPublicacion: e.target.value })}
          />
        </label>
        <label>
          Precio
          <input
            type="number"
            step="0.01"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
          />
        </label>
        <label>
          Autor
          <select
            value={form.autorId}
            onChange={(e) => setForm({ ...form, autorId: e.target.value })}
            required
          >
            <option value="">Selecciona un autor</option>
            {autores.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </label>
        <label>
          Género
          <select
            value={form.generoId}
            onChange={(e) => setForm({ ...form, generoId: e.target.value })}
            required
          >
            <option value="">Selecciona un género</option>
            {generos.map((g) => (
              <option key={g.id} value={g.id}>{g.nombre}</option>
            ))}
          </select>
        </label>
        <div className="actions">
          <button type="submit" className="btn-primary" disabled={sinCatalogos}>
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
              <th>Título</th>
              <th>Autor</th>
              <th>Género</th>
              <th>Año</th>
              <th>Precio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {libros.map((l) => (
              <tr key={l.id}>
                <td>{l.id}</td>
                <td>{l.titulo}</td>
                <td>{l.autorNombre || '-'}</td>
                <td>{l.generoNombre || '-'}</td>
                <td>{l.anioPublicacion || '-'}</td>
                <td>{l.precio != null ? `$${l.precio}` : '-'}</td>
                <td className="actions">
                  <button className="btn-secondary" onClick={() => handleEditar(l)}>Editar</button>
                  <button className="btn-danger" onClick={() => handleEliminar(l.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
