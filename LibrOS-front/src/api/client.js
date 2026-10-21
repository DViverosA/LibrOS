import axios from 'axios'

// Ajusta esta URL al puerto real de tu Web API (revisa Properties/launchSettings.json)
const API_BASE_URL = 'https://localhost:44384/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// --- Libros ---
export const getLibros = (filtros = {}) => {
  const params = {}
  if (filtros.buscar) params.buscar = filtros.buscar
  if (filtros.autorId) params.autorId = filtros.autorId
  if (filtros.generoId) params.generoId = filtros.generoId
  return api.get('/libros', { params })
}
export const getLibro = (id) => api.get(`/libros/${id}`)
export const crearLibro = (data) => api.post('/libros', data)
export const actualizarLibro = (id, data) => api.put(`/libros/${id}`, data)
export const eliminarLibro = (id) => api.delete(`/libros/${id}`)

// --- Autores ---
export const getAutores = () => api.get('/autores')
export const getAutor = (id) => api.get(`/autores/${id}`)
export const crearAutor = (data) => api.post('/autores', data)
export const actualizarAutor = (id, data) => api.put(`/autores/${id}`, data)
export const eliminarAutor = (id) => api.delete(`/autores/${id}`)

// --- Generos ---
export const getGeneros = () => api.get('/generos')
export const getGenero = (id) => api.get(`/generos/${id}`)
export const crearGenero = (data) => api.post('/generos', data)
export const actualizarGenero = (id, data) => api.put(`/generos/${id}`, data)
export const eliminarGenero = (id) => api.delete(`/generos/${id}`)

// --- Ventas ---
export const getVentas = () => api.get('/ventas')
export const crearVenta = (data) => api.post('/ventas', data)

// --- Clientes ---
export const getClientes = (buscar = '') =>
  api.get('/clientes', { params: buscar ? { buscar } : {} })
export const crearCliente = (data) => api.post('/clientes', data)
export const actualizarCliente = (id, data) => api.put(`/clientes/${id}`, data)
export const eliminarCliente = (id) => api.delete(`/clientes/${id}`)
export const getHistorialCliente = (id) => api.get(`/clientes/${id}/historial`)

// --- Reportes ---
export const getMasVendidos = (filtros = {}) => {
  const params = { top: filtros.top || 10 }
  if (filtros.desde) params.desde = filtros.desde
  if (filtros.hasta) params.hasta = filtros.hasta
  return api.get('/reportes/mas-vendidos', { params })
}

// --- Apartados ---
export const getApartados = (estado = '') =>
  api.get('/apartados', { params: estado ? { estado } : {} })
export const crearApartado = (data) => api.post('/apartados', data)
export const entregarApartado = (id) => api.put(`/apartados/${id}/entregar`)
export const cancelarApartado = (id) => api.put(`/apartados/${id}/cancelar`)

// --- Alertas ---
export const getAlertas = () => api.get('/alertas')