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
export const getLibros = () => api.get('/libros')
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
