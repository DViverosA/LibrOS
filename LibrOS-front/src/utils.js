const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

export const formatoMoneda = (valor) => moneda.format(valor ?? 0)

export const formatoFecha = (iso) =>
  new Date(iso).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })

// Extrae el mensaje que manda la API (texto plano o errores de validación)
export const mensajeError = (err, porDefecto) => {
  const data = err?.response?.data
  if (typeof data === 'string' && data) return data
  if (data?.errors) return Object.values(data.errors).flat().join(' ')
  return porDefecto
}
