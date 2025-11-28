<template>
  <div class="map-wrapper">
  <div ref="mapRef" class="map-area"></div>

  <div class="input-overlay">
    <div class="input-group">
      <i class="icon">📍</i>
      <input ref="originInput" type="text" placeholder="Local de partida..." />
    </div>
    <div class="input-group">
      <i class="icon">📌</i>
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
    componentRestrictions: { country: 'br' },
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
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  padding-bottom: 60px;
}
.map-area {
  position: absolute;
  top: 0;
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

.map-area {
  flex: 1; 
  min-height: 35vh; /* altura mínima */
  margin-bottom: 8px;
}

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
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.6); /* leve transparência */
  backdrop-filter: blur(4px); /* efeito de vidro fosco */
  padding: 12px;

}

</style>
