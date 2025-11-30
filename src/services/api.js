import axios from 'axios'

const API = axios.create({
    baseURL: 'http://localhost:3000'
})

// Interceptor para adicionar token automaticamente em todas as requisições
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de autenticação
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Não limpa o token automaticamente - deixa cada componente decidir o que fazer
    // Apenas loga o erro para debug
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Erro de autenticação:', error.response.status, error.response.data)
    }
    return Promise.reject(error)
  }
)

export function setAuthToken(token) {
    if (token) {
        localStorage.setItem('authToken', token)
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        localStorage.removeItem('authToken')
        delete API.defaults.headers.common['Authorization']
    }
}

export async function logout() {
  try {
    const token = localStorage.getItem('authToken')
    if (token) {
      await API.post('/logout')
    }
  } catch (error) {
    console.warn('Error during server logout:', error)
  } finally {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    delete API.defaults.headers.common['Authorization']
  }
}

export default API