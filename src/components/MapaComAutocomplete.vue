<template>
  <div class="map-wrapper">
    <Header />
    <div ref="mapRef" class="map-area"></div>

    <div v-show="!isWaiting && !tripActive" class="input-overlay">
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

    <div v-if="routeInfo && !isWaiting && !tripActive" class="route-info">
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

    <div v-if="tripActive" class="accepted-overlay">
      <h3>🚘 Em viagem...</h3>
      <div class="pulsing-circle"></div>
      <p>Você está a caminho do seu destino.</p>
      <p style="font-size: 0.9em; color: #666;">Aguarde o motorista finalizar a corrida.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { loadGoogleMaps } from '../composables/useGoogleMaps'
import Header from './Header.vue'

// Variáveis de Mapa e Rota
const originInput = ref(null)
const destinationInput = ref(null)
const mapRef = ref(null)
const routeInfo = ref(null)
const currentRouteId = ref(null)
const currentTripId = ref(null)

// Estados da Aplicação
const isWaiting = ref(false)      // True = Aguardando motorista aceitar
const tripActive = ref(false)     // True = Motorista aceitou e corrida está rolando
const timeLeft = ref(300)         // 5 minutos

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
  stopAll()
})

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

// --- FUNÇÃO DE LIMPEZA TOTAL ---
function stopAll() {
  if (timerInterval) clearInterval(timerInterval)
  if (pollingInterval) clearInterval(pollingInterval)
}

// Função auxiliar para atualizar o saldo visualmente
async function refreshUserBalance() {
  const token = localStorage.getItem('authToken')
  try {
    // Busca os dados fresquinhos do banco
    const res = await fetch('https://iboxt.duckdns.org/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (res.ok) {
      const userUpdated = await res.json()
      // Atualiza o localStorage
      localStorage.setItem('user', JSON.stringify(userUpdated))
      // Grita para o Header: "Ei, o saldo mudou!"
      window.dispatchEvent(new Event('auth-change'))
    }
  } catch (error) {
    console.error("Erro ao atualizar saldo:", error)
  }
}

function resetApp() {
    stopAll()
    isWaiting.value = false
    tripActive.value = false
    routeInfo.value = null
    currentRouteId.value = null
    currentTripId.value = null
    originInput.value.value = ''
    destinationInput.value.value = ''
    directionsRenderer.setDirections({routes: []})
}

// --- CONFIRMAR VIAGEM E INICIAR MONITORAMENTO ---
async function confirmTrip() {
  const token = localStorage.getItem('authToken')
  
  if (!currentRouteId.value) return alert('Calcule a rota primeiro')
  if (!token) return alert('Sessão expirada.')

  try {
    const res = await fetch('https://iboxt.duckdns.org/api/viagens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ routeId: currentRouteId.value })
    })
    
    const data = await res.json()
    
    if (data.sucesso) {
      currentTripId.value = data.trip._id
      refreshUserBalance()
      startMonitoring()
    } else {
      alert('Erro: ' + (data.erro || data.mensagem))
    }
  } catch (error) {
    console.error(error)
    alert('Erro de conexão')
  }
}

// --- MONITORAMENTO (POLLING) ---
function startMonitoring() {
  stopAll()

  isWaiting.value = true
  tripActive.value = false
  timeLeft.value = 300 

  // 1. Cronômetro de 5 minutos (Só roda enquanto estiver ESPERANDO)
  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      cancelTrip('Tempo limite excedido! Nenhum motorista encontrado.')
    }
  }, 1000)

  // 2. Polling Eterno (Roda enquanto a viagem existir)
  pollingInterval = setInterval(checkTripStatus, 3000) // Checa a cada 3s
}

async function checkTripStatus() {
  if (!currentTripId.value) return

  const token = localStorage.getItem('authToken')

  try {
    const url = `https://iboxt.duckdns.org/api/viagens/${currentTripId.value}`
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!res.ok) return // Ignora erros temporários

    const trip = await res.json()

    // 1. MOTORISTA ACEITOU (Corrida em andamento)
    if (trip.status === 'active' || trip.status === 'accepted') {
      // Paramos apenas o cronômetro de 5 min (pois já achou motorista)
      if (timerInterval) clearInterval(timerInterval)
      
      // Mudamos a tela para "Em Viagem"
      isWaiting.value = false
      tripActive.value = true
      
      // NOTA: NÃO paramos o pollingInterval! Continuamos checando.
    } 
    
    // 2. CORRIDA FINALIZADA (O motorista encerrou)
    else if (trip.status === 'completed') {
        stopAll() // Para o polling
        tripActive.value = false // Tira a tela de "Em viagem"
        
        // Exibe mensagem final ou modal de avaliação
        alert('Viagem finalizada! Chegamos ao destino.')
        
        resetApp() // Limpa tudo para nova corrida
    }

    // 3. CANCELADA
    else if (trip.status === 'canceled') {
        stopAll()
        alert('A viagem foi cancelada.')
        await refreshUserBalance()
        resetApp()
    }

  } catch (error) {
    console.error("Erro de conexão no polling:", error)
  }
}

async function cancelTrip(param) {
  const token = localStorage.getItem('authToken')
  const message = typeof param === 'string' ? param : 'Viagem cancelada.'

  stopAll()

  if (!currentTripId.value) {
      resetApp()
      return
  }

  try {
    const res = await fetch(`https://iboxt.duckdns.org/api/viagens/${currentTripId.value}/cancelar`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (res.ok || res.status === 400) { 
        alert(message)
        
        // --- ADICIONE ISTO AQUI ---
        await refreshUserBalance() // Atualiza o saldo no header imediatamente
        // --------------------------
    } else {
        const data = await res.json()
        alert('Erro: ' + (data.erro || data.mensagem))
    }
  } catch (error) {
    console.error(error)
  } finally {
    resetApp()
  }
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

        fetch('https://iboxt.duckdns.org/api/rota', {
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