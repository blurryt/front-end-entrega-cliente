<template>
  <header class="header">
    <div class="logo">iBoxt</div>
    
    <div class="header-right">
      <div v-if="user && user.balance !== undefined" class="balance-badge">
        <span class="currency">R$</span>
        <span class="amount">{{ Number(user.balance).toFixed(2) }}</span>
      </div>

      <button @click="goToProfile" class="profile-button">
        <span class="profile-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)

const goToProfile = () => {
  router.push('/profile')
}

const loadUser = () => {
  const storedUser = localStorage.getItem('user')
  const token = localStorage.getItem('authToken')

  // --- DEBUG: VAMOS VER O QUE TEM AQUI ---
  console.log("=== DEBUG HEADER ===")
  console.log("Token encontrado:", token)
  console.log("Usuário encontrado (texto):", storedUser)

  if (storedUser && token) {
    try {
      user.value = JSON.parse(storedUser)
      console.log("Usuário carregado no objeto:", user.value) 
      console.log("Saldo do usuário:", user.value.balance)
    } catch (e) {
      console.error("Erro ao converter JSON do usuário", e)
      user.value = null
    }
  } else {
    console.warn("Faltando token ou usuário no localStorage")
    user.value = null
  }
}

const handleAuthChange = () => {
  console.log("Evento de Auth recebido!")
  loadUser()
}

onMounted(() => {
  loadUser()
  window.addEventListener('auth-change', handleAuthChange)
})

onUnmounted(() => {
  window.removeEventListener('auth-change', handleAuthChange)
})
</script>

<style scoped>
.header {
  position: absolute;
  top: 0;
  z-index: 100; /* Importante para ficar acima do mapa */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 60px;
  left: 0;
  right: 0;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #000000;
}

/* Agrupa o saldo e o botão de perfil */
.header-right {
  display: flex;
  align-items: center;
  gap: 15px; /* Espaço entre o saldo e o perfil */
}

/* Estilo do Saldo */
.balance-badge {
  background-color: #f5f5f5;
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.currency {
  color: #28a745; /* Verde para o R$ */
  font-weight: bold;
}

.profile-button {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  background-color: #f0f0f0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.profile-button:hover {
  background-color: #e0e0e0;
}

.profile-icon svg {
  width: 24px;
  height: 24px;
}
</style>