import { useEffect, useMemo, useState } from 'react'
import {
  getLibros, crearLibro, actualizarLibro, eliminarLibro,
  getAutores, getGeneros
} from '../api/client'
import { formatoMoneda, mensajeError } from '../utils'

const POR_PAGINA = 10

const vacio = {
  titulo: '', isbn: '', anioPublicacion: '', precio: '0', cantidad: '1', autorId: '', generoId: ''
}

export default function LibrosPage() {
  const [libros, setLibros] = useState([])
  const [autores, setAutores] = useState([])
  const [generos, setGeneros] = useState([])
  const [form, setForm] = useState(vacio)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [orden, setOrden] = useState({ campo: 'titulo', dir: 'asc' })
  const [pagina, setPagina] = useState(1)

  const cargarLibros = async () => {
    try {
      const res = await getLibros(buscar.trim())
      setLibros(res.data)
      setError('')
    } catch (err) {
      setError(mensajeError(err, 'No se pudo cargar la lista de libros. Revisa que la API esté corriendo.'))
    } finally {
      setCargando(false)
    }
  }

  // Catálogos de autores y géneros (una sola vez)
  useEffect(() => {
    Promise.all([getAutores(), getGeneros()])
      .then(([a, g]) => { setAutores(a.data); setGeneros(g.data) })
      .catch(() => setError('No se pudieron cargar autores y géneros.'))
  }, [])

  // Búsqueda con retraso de 300 ms para no consultar en cada tecla
  useEffect(() => {
    const t = setTimeout(cargarLibros, 300)
    setPagina(1)
    return () => clearTimeout(t)
  }, [buscar])

  const ordenados = useMemo(() => {
    const copia = [...libros]
    const { campo, dir } = orden
    copia.sort((a, b) => {
      const x = a[campo] ?? ''
      const y = b[campo] ?? ''
      const r = typeof x === 'number' && typeof y === 'number'
        ? x - y
        : String(x).localeCompare(String(y), 'es')
      return dir === 'asc' ? r : -r
    })
    return copia
  }, [libros, orden])

  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const visibles = ordenados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA)

  const ordenarPor = (campo) => {
    setOrden((o) =>
      o.campo === campo
        ? { campo, dir: o.dir === 'asc' ? 'desc' : 'asc' }
        : { campo, dir: 'asc' })
    setPagina(1)
  }

  const flecha = (campo) =>
    orden.campo === campo ? (orden.dir === 'asc' ? ' ▲' : ' ▼') : ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    const precio = form.precio === '' ? 0 : Number(form.precio)
    const cantidad = form.cantidad === '' ? 1 : Number(form.cantidad)

    if (cantidad < 0) { setError('La cantidad no puede ser negativa.'); return }
    if (precio < 0) { setError('El precio no puede ser negativo.'); return }

    const payload = {
      titulo: form.titulo,
      isbn: form.isbn.trim() || null,
      anioPublicacion: form.anioPublicacion ? Number(form.anioPublicacion) : null,
      precio,
      cantidad,
      autorId: Number(form.autorId),
      generoId: Number(form.generoId)
    }

    try {
      if (editId) {
        await actualizarLibro(editId, payload)
      } else {
        await crearLibro(payload)
      }
      setForm(vacio)
      setEditId(null)
      setError('')
      cargarLibros()
    } catch (err) {
      setError(mensajeError(err, 'Error al guardar el libro. Verifica los datos.'))
    }
  }

  const handleEditar = (libro) => {
    setEditId(libro.id)
    setForm({
      titulo: libro.titulo,
      isbn: libro.isbn ?? '',
      anioPublicacion: libro.anioPublicacion ?? '',
      precio: libro.precio,
      cantidad: libro.cantidad,
      autorId: libro.autorId,
      generoId: libro.generoId
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este libro?')) return
    try {
      await eliminarLibro(id)
      cargarLibros()
    } catch (err) {
      setError(mensajeError(err, 'No se pudo eliminar el libro.'))
    }
  }

  const sinCatalogos = autores.length === 0 || generos.length === 0

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

      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="span-2">
          Título
          <input
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            required
          />
        </label>
        <label>
          ISBN
          <input
            value={form.isbn}
            maxLength={20}
            onChange={(e) => setForm({ ...form, isbn: e.target.value })}
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
            min="0"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
          />
        </label>
        <label>
          Cantidad en inventario
          <input
            type="number"
            step="1"
            min="0"
            value={form.cantidad}
            onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
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

      <div className="toolbar">
        <input
          type="search"
          placeholder="Buscar por ISBN, nombre o palabra clave del título..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
      </div>

      {error && <p className="error">{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th className="sortable" onClick={() => ordenarPor('titulo')}>Título{flecha('titulo')}</th>
                <th className="sortable" onClick={() => ordenarPor('isbn')}>ISBN{flecha('isbn')}</th>
                <th className="sortable" onClick={() => ordenarPor('autorNombre')}>Autor{flecha('autorNombre')}</th>
                <th className="sortable" onClick={() => ordenarPor('generoNombre')}>Género{flecha('generoNombre')}</th>
                <th className="sortable" onClick={() => ordenarPor('cantidad')}>Cantidad{flecha('cantidad')}</th>
                <th className="sortable" onClick={() => ordenarPor('precio')}>Precio{flecha('precio')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="muted">
                    {buscar.trim()
                      ? `No se encontraron coincidencias para "${buscar.trim()}".`
                      : 'Aún no hay libros registrados.'}
                  </td>
                </tr>
              ) : (
                visibles.map((l) => (
                  <tr key={l.id}>
                    <td>{l.titulo}</td>
                    <td>{l.isbn || '-'}</td>
                    <td>{l.autorNombre || '-'}</td>
                    <td>{l.generoNombre || '-'}</td>
                    <td>{l.cantidad}</td>
                    <td>{formatoMoneda(l.precio)}</td>
                    <td className="actions">
                      <button className="btn-secondary" onClick={() => handleEditar(l)}>Editar</button>
                      <button className="btn-danger" onClick={() => handleEliminar(l.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPaginas > 1 && (
            <div className="pagination">
              <button
                className="btn-secondary"
                disabled={paginaActual === 1}
                onClick={() => setPagina(paginaActual - 1)}
              >
                Anterior
              </button>
              <span>Página {paginaActual} de {totalPaginas}</span>
              <button
                className="btn-secondary"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPagina(paginaActual + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
