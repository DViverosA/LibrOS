import { useEffect, useMemo, useState } from 'react'
import {
  getLibros, crearLibro, actualizarLibro, eliminarLibro,
  getAutores, getGeneros
} from '../api/client'
import { formatoMoneda, mensajeError } from '../utils'
import MultiSelect from '../components/MultiSelect.jsx'

const POR_PAGINA = 10

const vacio = {
  titulo: '', isbn: '', anioPublicacion: '', precio: '0', cantidad: '1',
  autorIds: [], generoIds: []
}

const nombres = (lista) => lista.map((x) => x.nombre).join(', ')

const valorOrden = (libro, campo) => {
  if (campo === 'autores') return nombres(libro.autores)
  if (campo === 'generos') return nombres(libro.generos)
  return libro[campo] ?? ''
}

export default function LibrosPage() {
  const [libros, setLibros] = useState([])
  const [autores, setAutores] = useState([])
  const [generos, setGeneros] = useState([])
  const [form, setForm] = useState(vacio)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [cargando, setCargando] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [filtroAutor, setFiltroAutor] = useState('')
  const [filtroGenero, setFiltroGenero] = useState('')
  const [orden, setOrden] = useState({ campo: 'titulo', dir: 'asc' })
  const [pagina, setPagina] = useState(1)

  const hayFiltros = buscar.trim() !== '' || filtroAutor !== '' || filtroGenero !== ''

  const cargarLibros = async () => {
    try {
      const res = await getLibros({
        buscar: buscar.trim(),
        autorId: filtroAutor,
        generoId: filtroGenero
      })
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

  // Búsqueda y filtros, con retraso de 300 ms para no consultar en cada tecla
  useEffect(() => {
    const t = setTimeout(cargarLibros, 300)
    setPagina(1)
    return () => clearTimeout(t)
  }, [buscar, filtroAutor, filtroGenero])

  const ordenados = useMemo(() => {
    const copia = [...libros]
    const { campo, dir } = orden
    copia.sort((a, b) => {
      const x = valorOrden(a, campo)
      const y = valorOrden(b, campo)
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

  const limpiarFiltros = () => {
    setBuscar('')
    setFiltroAutor('')
    setFiltroGenero('')
  }

  // Devuelve el primer problema encontrado, o '' si todo está bien
  const validar = () => {
    if (!form.titulo.trim()) return 'El título es obligatorio.'
    if (form.autorIds.length === 0) return 'Selecciona al menos un autor.'
    if (form.generoIds.length === 0) return 'Selecciona al menos un género.'
    if (form.cantidad !== '' && (!Number.isInteger(Number(form.cantidad)) || Number(form.cantidad) < 0))
      return 'La cantidad debe ser un número entero y no puede ser negativa.'
    if (form.precio !== '' && Number(form.precio) < 0)
      return 'El precio no puede ser negativo.'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setExito('')

    const problema = validar()
    if (problema) { setError(problema); return }

    const payload = {
      titulo: form.titulo.trim(),
      isbn: form.isbn.trim() || null,
      anioPublicacion: form.anioPublicacion ? Number(form.anioPublicacion) : null,
      precio: form.precio === '' ? 0 : Number(form.precio),
      cantidad: form.cantidad === '' ? 1 : Number(form.cantidad),
      autorIds: form.autorIds,
      generoIds: form.generoIds
    }

    try {
      if (editId) {
        await actualizarLibro(editId, payload)
        setExito('Libro actualizado correctamente.')
      } else {
        await crearLibro(payload)
        setExito('Libro guardado correctamente.')
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
    setError('')
    setExito('')
    setForm({
      titulo: libro.titulo,
      isbn: libro.isbn ?? '',
      anioPublicacion: libro.anioPublicacion ?? '',
      precio: libro.precio,
      cantidad: libro.cantidad,
      autorIds: libro.autores.map((a) => a.id),
      generoIds: libro.generos.map((g) => g.id)
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelar = () => {
    setEditId(null)
    setForm(vacio)
    setError('')
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este libro?')) return
    setExito('')
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
        <h1>Inventario</h1>
      </div>

      {sinCatalogos && (
        <p className="error">
          Necesitas al menos un Autor y un Género antes de poder agregar libros.
        </p>
      )}

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <label className="span-2">
          Título
          <input
            value={form.titulo}
            maxLength={200}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
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
        <MultiSelect
          className="span-2"
          etiqueta="Autores"
          placeholder="Agregar autor..."
          opciones={autores}
          seleccion={form.autorIds}
          onChange={(ids) => setForm({ ...form, autorIds: ids })}
        />
        <MultiSelect
          className="span-2"
          etiqueta="Géneros"
          placeholder="Agregar género..."
          opciones={generos}
          seleccion={form.generoIds}
          onChange={(ids) => setForm({ ...form, generoIds: ids })}
        />
        <div className="actions">
          <button type="submit" className="btn-primary" disabled={sinCatalogos}>
            Guardar
          </button>
          {editId && (
            <button type="button" className="btn-secondary" onClick={handleCancelar}>
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
          placeholder="Buscar por ISBN, nombre o palabra clave del título..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
        <select
          value={filtroAutor}
          onChange={(e) => setFiltroAutor(e.target.value)}
          aria-label="Filtrar por autor"
        >
          <option value="">Todos los autores</option>
          {autores.map((a) => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </select>
        <select
          value={filtroGenero}
          onChange={(e) => setFiltroGenero(e.target.value)}
          aria-label="Filtrar por género"
        >
          <option value="">Todos los géneros</option>
          {generos.map((g) => (
            <option key={g.id} value={g.id}>{g.nombre}</option>
          ))}
        </select>
        {hayFiltros && (
          <button type="button" className="btn-secondary" onClick={limpiarFiltros}>
            Limpiar
          </button>
        )}
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="sortable" onClick={() => ordenarPor('titulo')}>Título{flecha('titulo')}</th>
                  <th className="sortable" onClick={() => ordenarPor('isbn')}>ISBN{flecha('isbn')}</th>
                  <th className="sortable" onClick={() => ordenarPor('autores')}>Autores{flecha('autores')}</th>
                  <th className="sortable" onClick={() => ordenarPor('generos')}>Géneros{flecha('generos')}</th>
                  <th className="sortable" onClick={() => ordenarPor('cantidad')}>Cantidad{flecha('cantidad')}</th>
                  <th className="sortable" onClick={() => ordenarPor('precio')}>Precio{flecha('precio')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="muted">
                      {hayFiltros
                        ? 'No se encontraron coincidencias con la búsqueda o los filtros aplicados.'
                        : 'Aún no hay libros registrados.'}
                    </td>
                  </tr>
                ) : (
                  visibles.map((l) => (
                    <tr key={l.id}>
                      <td>{l.titulo}</td>
                      <td>{l.isbn || '-'}</td>
                      <td>{nombres(l.autores) || '-'}</td>
                      <td>{nombres(l.generos) || '-'}</td>
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
          </div>

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