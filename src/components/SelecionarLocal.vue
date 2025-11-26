<template>
  <div class="container">
    <h2>Schedule a Transport</h2>

    <!-- Pickup Time -->
    <div class="pickup-time">
      <label>Pickup Later</label>
      <select v-model="pickupTime">
        <option value="now">Now</option>
        <option value="later">Pickup Later</option>
      </select>
    </div>

    <!-- Origem -->
    <div class="input-group">
      <i class="icon">📍</i>
      <input ref="originInput" type="text" placeholder="Current Location" />
    </div>

    <!-- Destino -->
    <div class="input-group">
      <i class="icon">📌</i>
      <input ref="destinationInput" type="text" placeholder="Where to ?" />
    </div>

    <!-- Botão -->
    <button @click="confirmSelection">Next</button>

    <!-- Navegação inferior -->
    <nav class="bottom-nav">
      <span> Home</span>
      <span> Job</span>
      <span> Account</span>
      <span> Profile</span>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loadGoogleMaps } from '../composables/useGoogleMaps'

const router = useRouter()
const originInput = ref(null)
const destinationInput = ref(null)
const pickupTime = ref('later')
// const google = await loadGoogleMaps(['places'])


let autocompleteOrigin, autocompleteDestination

onMounted(async () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  console.log("AQUI" + apiKey)
  const google = await loadGoogleMaps(apiKey, ['places'])

  autocompleteOrigin = new google.places.Autocomplete(originInput.value)
  autocompleteDestination = new google.places.Autocomplete(destinationInput.value)
})

function confirmSelection() {
  const origem = originInput.value.value
  const destino = destinationInput.value.value
  const modo = pickupTime.value

  if (!origem || !destino) {
    alert('Preencha origem e destino')
    return
  }

  // Redireciona para /mapa com os dados via query
  router.push({
    path: '/mapa',
    query: {
      origem,
      destino,
      modo,
    },
  })
}
</script>

<style scoped>
.container {
  padding: 20px;
}
.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.input-group input {
  flex: 1;
  padding: 8px;
}
.icon {
  margin-right: 8px;
}
button {
  background: black;
  color: white;
  padding: 10px;
  border: none;
  width: 100%;
  margin-top: 16px;
}
.bottom-nav {
  display: flex;
  justify-content: space-around;
  margin-top: 40px;
  border-top: 1px solid #ccc;
  padding-top: 12px;
}
</style>
