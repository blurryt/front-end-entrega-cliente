<template>


  <div class="map-wrapper">
    <Header />
    <div ref="mapRef" class="map-area"></div>

    <div class="input-overlay">
      <div class="input-group">
        <i class="icon">
          <svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
            width="20px" height="24px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve"
            fill="#000000">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <g>
                <path fill="#000000"
                  d="M32,0C18.745,0,8,10.745,8,24c0,5.678,2.502,10.671,5.271,15l17.097,24.156C30.743,63.686,31.352,64,32,64 s1.257-0.314,1.632-0.844L50.729,39C53.375,35.438,56,29.678,56,24C56,10.745,45.255,0,32,0z M48.087,39h-0.01L32,61L15.923,39 h-0.01C13.469,35.469,10,29.799,10,24c0-12.15,9.85-22,22-22s22,9.85,22,22C54,29.799,50.281,35.781,48.087,39z">
                </path>
                <path fill="#000000"
                  d="M32,14c-5.523,0-10,4.478-10,10s4.477,10,10,10s10-4.478,10-10S37.523,14,32,14z M32,32 c-4.418,0-8-3.582-8-8s3.582-8,8-8s8,3.582,8,8S36.418,32,32,32z">
                </path>
                <path fill="#000000"
                  d="M32,10c-7.732,0-14,6.268-14,14s6.268,14,14,14s14-6.268,14-14S39.732,10,32,10z M32,36 c-6.627,0-12-5.373-12-12s5.373-12,12-12s12,5.373,12,12S38.627,36,32,36z">
                </path>
              </g>
            </g>
          </svg>
        </i>
        <input ref="originInput" type="text" placeholder="Local de partida..." />
      </div>
      <div class="input-group">
        <i class="icon">
          <svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
            width="20px" height="24px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve"
            fill="#000000">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <g>
                <path fill="#000000"
                  d="M32,0C18.745,0,8,10.745,8,24c0,5.678,2.502,10.671,5.271,15l17.097,24.156C30.743,63.686,31.352,64,32,64 s1.257-0.314,1.632-0.844L50.729,39C53.375,35.438,56,29.678,56,24C56,10.745,45.255,0,32,0z M32,38c-7.732,0-14-6.268-14-14 s6.268-14,14-14s14,6.268,14,14S39.732,38,32,38z">
                </path>
                <path fill="#000000"
                  d="M32,12c-6.627,0-12,5.373-12,12s5.373,12,12,12s12-5.373,12-12S38.627,12,32,12z M32,34 c-5.523,0-10-4.478-10-10s4.477-10,10-10s10,4.478,10,10S37.523,34,32,34z">
                </path>
              </g>
            </g>
          </svg>
        </i>
        <input ref="destinationInput" type="text" placeholder="Destino..." />
      </div>
      <button @click="traceRoute">Confirmar</button>
    </div>

    <div v-if="routeInfo" class="route-info">
      <p><strong>Distância:</strong> {{ routeInfo.distance }}</p>
      <p><strong>Duração:</strong> {{ routeInfo.duration }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { loadGoogleMaps } from '../composables/useGoogleMaps'
import Header from './Header.vue'

const originInput = ref(null)
const destinationInput = ref(null)
const mapRef = ref(null)
const routeInfo = ref(null)

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

  })

  directionsService = new google.DirectionsService()
  directionsRenderer = new google.DirectionsRenderer({ suppressMarkers: false })
  directionsRenderer.setMap(map)

  // Opções para restringir buscas a Campo Grande - MS
  const options = {
    bounds: new google.LatLngBounds(
      { lat: -20.55, lng: -54.75 },
      { lat: -20.35, lng: -54.50 }
    ),
    strictBounds: false,
    componentRestrictions: { country: 'br' }
  }

  // Autocomplete clássico
  autocompleteOrigin = new google.places.Autocomplete(originInput.value, options)
  autocompleteDestination = new google.places.Autocomplete(destinationInput.value, options)
})

function traceRoute() {
  const origin = originInput.value.value
  const destination = destinationInput.value.value

  if (!origin || !destination) {
    alert('Preencha origem e destino')
    return
  }

  directionsService.route(
    {
      origin,
      destination,
      travelMode: 'DRIVING',
    },
    (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result)

        const service = new google.maps.DistanceMatrixService()
        service.getDistanceMatrix(
          {
            origins: [origin],
            destinations: [destination],
            travelMode: 'DRIVING',
          },
          (response, status) => {
            if (status === 'OK') {
              const element = response.rows[0].elements[0]
              routeInfo.value = {
                distance: element.distance.text,
                duration: element.duration.text,
              }

              // ✅ Envia os dados para o servidor após calcular
              fetch('http://localhost:3000/rota', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  origem: origin,
                  destino: destination,
                  distancia: element.distance.text,
                  duracao: element.duration.text,
                }),
              })
                .then(res => res.json())
                .then(data => console.log('Resposta do servidor:', data))
                .catch(err => console.error('Erro ao enviar rota:', err))
            }
          }
        )
      } else {
        alert('Erro ao traçar rota: ' + status)
      }
    }
  )
}

</script>


<style scoped>
.container {
  padding: 12px;
  position: relative;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.map-wrapper {
  /* position: fixed; */
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
  /* padding-bottom: 60px; */
}

.map-area {
  position: absolute;
  top: 84px;
  left: 0;
  right: 0;
  bottom: 0;
}

.route-info {
  position: absolute;
  bottom: 80px;
  left: 20px;
  background: white;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 15;
}

.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.input-group input {
  flex: 1;
  padding: 6px;
  font-size: 14px;
}

.icon {
  margin-right: 6px;
  font-size: 16px;
}

button {
  background: black;
  color: white;
  padding: 8px;
  border: none;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 10px;
  font-size: 14px;
}

/* .map-area {
  flex: 1; 
  min-height: 45vh; 
  margin-bottom: 8px;
} */

.route-info {
  background: #f9f9f9;
  padding: 8px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 8px;
}

.bottom-nav {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #ccc;
  padding: 8px 0;
  position: sticky;
  bottom: 0;
  background: white;
  font-size: 14px;
}

.input-overlay {
  position: absolute;
  top: 86px;
  left: 20px;
  right: 20px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.6);
  /* leve transparência */
  backdrop-filter: blur(4px);
  /* efeito de vidro fosco */
  padding: 12px;

}
</style>
