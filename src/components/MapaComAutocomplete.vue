<template>
  <div class="map-wrapper">
    <div ref="mapRef" class="map-area"></div>

    <div class="schedule-options">
      <h3>Schedule it Anytime</h3>
      <div class="option-buttons">
        <button :class="{ active: mode === 'now' }" @click="mode = 'now'">Now</button>
        <button :class="{ active: mode === 'later' }" @click="mode = 'later'">Pickup Later</button>
      </div>
    </div>

    <div class="input-box">
      <input ref="originInput" type="text" placeholder="Origem..." />
      <input ref="destinationInput" type="text" placeholder="Destino..." />
      <button @click="traceRoute">Agendar</button>
    </div>

    <div v-if="routeInfo" class="route-info">
      <p><strong>Distância:</strong> {{ routeInfo.distance }}</p>
      <p><strong>Duração:</strong> {{ routeInfo.duration }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { loadGoogleMaps } from '@/composables/useGoogleMaps.js'

const route = useRoute();
const origem = route.query.origem
const destino = route.query.destino
const modo = route.query.modo

const mapRef = ref(null)
const originInput = ref(null)
const destinationInput = ref(null)
const mode = ref(modo || 'later')
const routeInfo = ref(null)

let map, directionsService, directionsRenderer, autocompleteOrigin, autocompleteDestination

onMounted(async () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const google = await loadGoogleMaps(apiKey, ['places'])

  map = new google.Map(mapRef.value, {
    center: { lat: -20.4697, lng: -54.6201 }, // Campo Grande, MS
    zoom: 14,
  })

  directionsService = new google.DirectionsService()
  directionsRenderer = new google.DirectionsRenderer({ suppressMarkers: false })
  directionsRenderer.setMap(map)

  autocompleteOrigin = new google.places.Autocomplete(originInput.value)
  autocompleteDestination = new google.places.Autocomplete(destinationInput.value)

  // Preenche os campos com os dados recebidos
  originInput.value.value = origem || ''
  destinationInput.value.value = destino || ''

  // Traça a rota automaticamente se os dados vierem preenchidos
  if (origem && destino) {
    traceRoute()
  }
})

async function traceRoute() {
  const origin = originInput.value.value
  const destination = destinationInput.value.value

  if (!origin || !destination) return

  directionsService.route(
    {
      origin,
      destination,
      travelMode: 'DRIVING',
    },
    async (result, status) => {
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
.map-wrapper {
  width: 100vw;
  height: 100vh;
  position: relative;
}
.map-area {
  width: 100%;
  height: 100%;
}
.schedule-options {
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  padding: 12px;
  border-radius: 8px;
}
.option-buttons button {
  margin-right: 8px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
}
.option-buttons .active {
  background: black;
  color: white;
}
.input-box {
  position: absolute;
  bottom: 100px;
  left: 20px;
  background: white;
  padding: 12px;
  border-radius: 8px;
}
.input-box input {
  display: block;
  margin-bottom: 8px;
  width: 250px;
}
.route-info {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: white;
  padding: 10px;
  border-radius: 8px;
}
</style>
