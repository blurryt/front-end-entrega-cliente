import { createRouter, createWebHistory } from 'vue-router'
import SelecionarLocal from '../components/SelecionarLocal.vue'
import MapaComAutocomplete from "@/components/MapaComAutocomplete.vue"


const routes = [
{
   path: '/',
   name: 'SelecionarLocal',
  component: SelecionarLocal,
 },
  {
    path: '/mapa',
    name: 'MapaComAutocomplete',
    component: MapaComAutocomplete,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
