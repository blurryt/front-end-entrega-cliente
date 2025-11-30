<template>
  <div class="map-wrapper">
    <Header />
    <div ref="mapRef" class="map-area"></div>

    <div v-if="!isWaiting && !tripAccepted" class="input-overlay">
      <div class="input-group">
        <i class="icon">📍</i>
        <input ref="originInput" type="text" placeholder="Local de partida..." />
      </div>
      <div class="input-group">
        <i class="icon">🏁</i>
        <input ref="destinationInput" type="text" placeholder="Destino..." />
      </div>
      <button @click="traceRoute">Calcular Rota</button>
    </div>

    <div v-if="routeInfo && !isWaiting && !tripAccepted" class="route-info">
      <p><strong>Distância:</strong> {{ routeInfo.distance }}</p>
      <p><strong>Duração:</strong> {{ routeInfo.duration }}</p>
      <p class="valor-destaque"><strong>Valor:</strong> R$ {{ routeInfo.valor }}</p>
      <button @click="confirmTrip" class="btn-confirm">Chamar Motorista</button>
    </div>

    <div v-if="isWaiting" class="waiting-overlay">
      <h3>Procurando Motorista...</h3>
      <div class="loader"></div>
      <p>Tempo restante: {{ formatTime(timeLeft) }}</p>
      <p>Aguarde, estamos conectando você...</p>
      <button @click="cancelTrip" class="btn-cancel">Cancelar Pedido</button>
    </div>

    <div v-if="tripAccepted" class="accepted-overlay">
      <h3>🚗 Motorista a caminho!</h3>
      <p>Seu motorista aceitou a corrida.</p>
      <button @click="resetApp">Nova Corrida</button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { loadGoogleMaps } from '../composables/useGoogleMaps'
import Header from './Header.vue'

const originInput = ref(null)
const destinationInput = ref(null)
const mapRef = ref(null)
const routeInfo = ref(null)
const currentRouteId = ref(null)
const currentTripId = ref(null)

const isWaiting = ref(false)
const tripAccepted = ref(false)
const timeLeft = ref(300)
let pollingInterval = null
let timerInterval = null

let map, directionsService, directionsRenderer, autocompleteOrigin, autocompleteDestination

onMounted(async () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const google = await loadGoogleMaps(apiKey, ['places'])
  
  const campoGrande = { lat: -20.4697, lng: -54.6201 }

  map = new google.Map(mapRef.value, {
    center: campoGrande,
    zoom: 14,
    mapTypeControl: false,
    fullscreenControl: false,
    disableDefaultUI: true
  })

  directionsService = new google.DirectionsService()
  directionsRenderer = new google.DirectionsRenderer({ suppressMarkers: false })
  directionsRenderer.setMap(map)

  const options = {
    bounds: new google.LatLngBounds({ lat: -20.55, lng: -54.75 }, { lat: -20.35, lng: -54.50 }),
    strictBounds: false, componentRestrictions: { country: 'br' }
  }

  autocompleteOrigin = new google.places.Autocomplete(originInput.value, options)
  autocompleteDestination = new google.places.Autocomplete(destinationInput.value, options)
})

onUnmounted(() => {
  stopPolling()
})

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

// --- FUNÇÃO DE CANCELAMENTO UNIFICADA ---
// O parametro 'param' pode ser um Evento (clique do botão) ou uma String (mensagem de timeout)
async function cancelTrip(param) {
  const token = localStorage.getItem('authToken')
  
  // Define a mensagem: se 'param' for texto, usa ele. Se for evento (clique), usa padrão.
  const message = typeof param === 'string' ? param : 'Viagem cancelada com sucesso.'

  // 1. Para o cronômetro imediatamente
  stopPolling()

  // 2. Se não tem ID de viagem (cancelamento local), só reseta
  if (!currentTripId.value) {
      isWaiting.value = false
      resetApp()
      return
  }

  try {
    // 3. Chama o backend para cancelar no banco
    console.log(currentTripId.value)
    const res = await fetch(`http://localhost:3000/viagens/${currentTripId.value}`, {
        method: 'PATCH',
        headers: { 
            "Content-Type":"application/json" 
        },
        body: JSON.stringify({
          status: 'canceled'
        })
    })

    const data = await res.json()

    if (res.ok) {
        alert(message)
    } else {
        // Se a viagem já foi aceita ou concluída, o backend vai avisar aqui
        alert('Aviso: ' + (data.erro || data.mensagem))
    }

  } catch (error) {
    console.error('Erro ao cancelar', error)
  } finally {
    // 4. Limpa a tela independente do resultado
    isWaiting.value = false
    resetApp()
  }
}

async function confirmTrip() {
  const token = localStorage.getItem('authToken')
  
  if (!currentRouteId.value) return alert('Calcule a rota primeiro')
  if (!token) return alert('Sessão expirada.')

  try {
    const res = await fetch('http://localhost:3000/viagens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ routeId: currentRouteId.value })
    })
    
    const data = await res.json()
    
    if (data.sucesso) {
      currentTripId.value = data.trip._id
      startWaiting()
    } else {
      alert('Erro: ' + (data.erro || data.mensagem))
    }
  } catch (error) {
    console.error(error)
    alert('Erro de conexão')
  }
}

function startWaiting() {
  isWaiting.value = true
  timeLeft.value = 300 

  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      // Aqui passamos uma string, então a função cancelTrip vai usar essa mensagem
      cancelTrip('Tempo limite excedido! Nenhum motorista encontrado.')
    }
  }, 1000)

  pollingInterval = setInterval(checkTripStatus, 3000)
}

async function checkTripStatus() {
  const token = localStorage.getItem('authToken')
  try {
    const res = await fetch(`http://localhost:3000/viagens/${currentTripId.value}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const trip = await res.json()

    if (trip.status === 'active' || trip.status === 'accepted') {
      stopPolling()
      isWaiting.value = false
      tripAccepted.value = true
    }
    
    if (trip.status === 'canceled') {
        cancelTrip('Viagem cancelada.')
    }

  } catch (error) {
    console.error("Erro no polling", error)
  }
}

function stopPolling() {
  if (timerInterval) clearInterval(timerInterval)
  if (pollingInterval) clearInterval(pollingInterval)
}

function resetApp() {
    tripAccepted.value = false
    routeInfo.value = null
    currentRouteId.value = null
    currentTripId.value = null
    originInput.value = ''
    destinationInput.value = ''
    directionsRenderer.setDirections({routes: []})
}

function traceRoute() {
  const origin = originInput.value.value
  const destination = destinationInput.value.value
  const token = localStorage.getItem('authToken')

  if (!origin || !destination) return alert('Preencha os campos')

  directionsService.route(
    { origin, destination, travelMode: 'DRIVING' },
    (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result)
        const leg = result.routes[0].legs[0]
        
        routeInfo.value = {
            distance: leg.distance.text,
            duration: leg.duration.text,
            valor: 'Calculando...'
        }

        fetch('http://localhost:3000/rota', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                origem: origin, destino: destination,
                distanciaValue: leg.distance.value, duracaoValue: leg.duration.value
            }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.sucesso) {
                currentRouteId.value = data.dados.routeId
                routeInfo.value = { ...routeInfo.value, valor: data.dados.preco.toFixed(2).replace('.', ',') }
            } else {
                alert('Erro: ' + (data.erro || data.mensagem))
            }
        }).catch(err => console.error(err))
      } else { alert('Rota não encontrada') }
    }
  )
}
</script>

<style scoped>
/* Estilos anteriores... */
.map-wrapper { width: 100vw; height: 100vh; position: relative; }
.map-area { position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 1; }
.input-overlay { position: absolute; top: 100px; left: 20px; right: 20px; z-index: 10; background: rgba(255,255,255,0.9); padding: 15px; border-radius: 10px; }
.input-group { display: flex; margin-bottom: 10px; background: #eee; padding: 5px; border-radius: 5px; }
.input-group input { flex: 1; border: none; background: transparent; padding: 5px; outline: none; }
.icon { padding: 5px; }
button { width: 100%; padding: 10px; background: black; color: white; border: none; border-radius: 5px; cursor: pointer; }
.route-info { position: absolute; bottom: 20px; left: 20px; right: 20px; background: white; padding: 20px; border-radius: 10px; z-index: 15; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); }
.valor-destaque { color: green; font-size: 1.2em; margin: 10px 0; }
.btn-confirm { background: green; margin-top: 5px; }

/* ESTILOS NOVOS PARA O LOADING */
.waiting-overlay, .accepted-overlay {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0,0,0,0.3);
  z-index: 20;
  width: 80%;
  max-width: 400px;
}
.btn-cancel { background: #dc3545; margin-top: 15px; }
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #000;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 15px auto;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>