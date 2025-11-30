import { createRouter, createWebHistory } from 'vue-router'
import SelecionarLocal from '../components/SelecionarLocal.vue'
import MapaComAutocomplete from "@/components/MapaComAutocomplete.vue"
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import Profile from '../views/Profile.vue'

// Função para verificar se o usuário está autenticado
const isAuthenticated = () => {
  const token = localStorage.getItem('authToken')
  // Verifica se o token existe e não é apenas uma string vazia
  if (!token || token.trim() === '') {
    return false
  }
  return true
}

const routes = [
{
   path: '/',
   name: 'SelecionarLocal',
  component: SelecionarLocal,
  meta: { requiresAuth: true }
 },
  {
    path: '/home',
    name: 'MapaComAutocomplete',
    component: MapaComAutocomplete,
    meta: { requiresAuth: true }
  },
  // { 
  //   path: '/',
  //   name: 'Home', 
  //   component: Home 
  // }, 
  { 
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  { 
    path: '/register', 
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  { 
    path: '/profile', 
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Guard global de navegação
router.beforeEach((to, from, next) => {
  const authenticated = isAuthenticated()
  
  // Se a rota requer autenticação
  if (to.meta.requiresAuth && !authenticated) {
    next('/login')
  }
  // Se a rota é para visitantes (login/register) mas o usuário já está logado
  else if (to.meta.requiresGuest && authenticated) {
    next('/home')
  }
  // Permite a navegação
  else {
    next()
  }
})

export default router
