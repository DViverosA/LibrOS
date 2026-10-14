export default function MultiSelect({
  etiqueta, placeholder, opciones, seleccion, onChange, className = ''
}) {
  const disponibles = opciones.filter((o) => !seleccion.includes(o.id))
  const nombreDe = (id) => opciones.find((o) => o.id === id)?.nombre ?? `#${id}`

  const agregar = (e) => {
    const id = Number(e.target.value)
    if (id) onChange([...seleccion, id])
  }

  return (
    <div className={`multi ${className}`}>
      <label>
        {etiqueta}
        <select value="" onChange={agregar} disabled={disponibles.length === 0}>
          <option value="">{disponibles.length ? placeholder : 'No hay más opciones'}</option>
          {disponibles.map((o) => (
            <option key={o.id} value={o.id}>{o.nombre}</option>
          ))}
        </select>
      </label>
      <div className="chips">
        {seleccion.length === 0 ? (
          <span className="muted">Ninguno seleccionado</span>
        ) : (
          seleccion.map((id) => (
            <span className="chip" key={id}>
              {nombreDe(id)}
              <button
                type="button"
                aria-label={`Quitar ${nombreDe(id)}`}
                onClick={() => onChange(seleccion.filter((x) => x !== id))}
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  )
}