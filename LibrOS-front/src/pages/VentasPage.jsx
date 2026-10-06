import { useEffect, useMemo, useState } from 'react'
import { getLibros, crearVenta } from '../api/client'
import { formatoMoneda, mensajeError } from '../utils'

export default function VentasPage() {
  const [libros, setLibros] = useState([])
  const [buscar, setBuscar] = useState('')
  const [carrito, setCarrito] = useState([])
  const [vendedor, setVendedor] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cargarLibros = async () => {
    try {
      const res = await getLibros()
      setLibros(res.data)
    } catch (err) {
      setError(mensajeError(err, 'No se pudo cargar el catálogo de libros.'))
    }
  }

  useEffect(() => { cargarLibros() }, [])

  // Solo se pueden vender libros con stock y con precio definido
  const disponibles = useMemo(() => {
    const t = buscar.trim().toLowerCase()
    return libros
      .filter((l) => l.cantidad > 0 && l.precio > 0)
      .filter((l) =>
        !t ||
        l.titulo.toLowerCase().includes(t) ||
        (l.isbn ?? '').toLowerCase().includes(t))
      .slice(0, 8)
  }, [libros, buscar])

  // Total en tiempo real (en centavos para evitar errores de decimales)
  const total = useMemo(
    () => carrito.reduce((s, i) => s + Math.round(i.precio * 100) * i.cantidad, 0) / 100,
    [carrito]
  )

  const agregar = (libro) => {
    setExito('')
    const existente = carrito.find((i) => i.libroId === libro.id)

    if (!existente) {
      setError('')
      setCarrito([
        ...carrito,
        { libroId: libro.id, titulo: libro.titulo, precio: libro.precio, stock: libro.cantidad, cantidad: 1 }
      ])
    } else if (existente.cantidad >= existente.stock) {
      setError(`Stock insuficiente de "${libro.titulo}": solo hay ${existente.stock} disponibles.`)
    } else {
      setError('')
      setCarrito(carrito.map((i) =>
        i.libroId === libro.id ? { ...i, cantidad: i.cantidad + 1 } : i))
    }
  }

  const cambiarCantidad = (libroId, valor) => {
    const item = carrito.find((i) => i.libroId === libroId)
    let n = Math.floor(Number(valor)) || 1

    if (n > item.stock) {
      setError(`Stock insuficiente de "${item.titulo}": solo hay ${item.stock} disponibles.`)
      n = item.stock
    } else {
      setError('')
    }

    n = Math.max(n, 1)
    setCarrito(carrito.map((i) => (i.libroId === libroId ? { ...i, cantidad: n } : i)))
  }

  const quitar = (libroId) => {
    setError('')
    setCarrito(carrito.filter((i) => i.libroId !== libroId))
  }

  const registrar = async () => {
    setError('')
    setExito('')

    if (!vendedor.trim()) { setError('Indica el nombre del vendedor.'); return }
    if (carrito.length === 0) { setError('Agrega al menos un libro a la venta.'); return }

    setEnviando(true)
    try {
      const res = await crearVenta({
        vendedor: vendedor.trim(),
        items: carrito.map((i) => ({ libroId: i.libroId, cantidad: i.cantidad }))
      })
      setExito(`Venta #${res.data.id} registrada por ${formatoMoneda(res.data.total)}.`)
      setCarrito([])
    } catch (err) {
      setError(mensajeError(err, 'No se pudo registrar la venta.'))
    } finally {
      setEnviando(false)
      cargarLibros() // refresca el stock mostrado
    }
  }

  return (
    <div>
      <div className="header-row">
        <h1>Nueva venta</h1>
      </div>

      <div className="panel">
        <label>
          Buscar libro (título o ISBN)
          <input
            type="search"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Escribe para buscar..."
          />
        </label>

        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Stock</th>
              <th>Precio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {disponibles.length === 0 ? (
              <tr>
                <td colSpan={4} className="muted">
                  No hay libros disponibles que coincidan (se necesita stock y precio mayor a 0).
                </td>
              </tr>
            ) : (
              disponibles.map((l) => (
                <tr key={l.id}>
                  <td>{l.titulo}</td>
                  <td>{l.cantidad}</td>
                  <td>{formatoMoneda(l.precio)}</td>
                  <td>
                    <button className="btn-primary" onClick={() => agregar(l)}>Agregar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h2>Carrito</h2>

        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {carrito.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">El carrito está vacío.</td>
              </tr>
            ) : (
              carrito.map((i) => (
                <tr key={i.libroId}>
                  <td>{i.titulo}</td>
                  <td>{formatoMoneda(i.precio)}</td>
                  <td>
                    <input
                      className="qty-input"
                      type="number"
                      min="1"
                      max={i.stock}
                      value={i.cantidad}
                      onChange={(e) => cambiarCantidad(i.libroId, e.target.value)}
                    />
                  </td>
                  <td>{formatoMoneda((Math.round(i.precio * 100) * i.cantidad) / 100)}</td>
                  <td>
                    <button className="btn-danger" onClick={() => quitar(i.libroId)}>Quitar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="total">Total: {formatoMoneda(total)}</div>

        <label>
          Vendedor
          <input
            value={vendedor}
            maxLength={100}
            onChange={(e) => setVendedor(e.target.value)}
          />
        </label>

        {error && <p className="error">{error}</p>}
        {exito && <p className="success">{exito}</p>}

        <div className="actions">
          <button className="btn-primary" onClick={registrar} disabled={enviando}>
            {enviando ? 'Registrando...' : 'Registrar venta'}
          </button>
        </div>
      </div>
    </div>
  )
}
