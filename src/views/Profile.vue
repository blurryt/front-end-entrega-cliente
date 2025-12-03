<template>
  <div class="profile-container">
    <div class="profile-card">
      
      <button @click="goBack" class="back-button">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 19L8 12L15 5" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div class="profile-avatar">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <h1 class="profile-title">Meu Perfil</h1>

      <div class="profile-info">
        <div class="info-group">
          <label>Nome</label>
          <div class="info-value">
            {{ isLoading ? 'Carregando...' : (user.firstName || 'N/A') }}
          </div>
        </div>

        <div class="info-group">
          <label>Sobrenome</label>
          <div class="info-value">
            {{ isLoading ? 'Carregando...' : (user.lastName || 'N/A') }}
          </div>
        </div>

        <div class="info-group">
          <label>Email</label>
          <div class="info-value">
            {{ isLoading ? 'Carregando...' : (user.email || 'N/A') }}
          </div>
        </div>
        
        <div class="info-group">
          <label>Saldo Atual</label>
          <div class="info-value" style="color: green; font-weight: bold;">
            R$ {{ isLoading ? '...' : (user.balance?.toFixed(2) || '0.00') }}
          </div>
        </div>
      </div>

      <button @click="handleLogout" class="logout-button">Sair</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(true)
const user = ref({
  firstName: '',
  lastName: '',
  email: '',
  balance: 0
})

const goBack = () => {
  router.push('/home') // Garante que volta para o mapa
}

// Carregar dados do usuário
const loadUserData = async () => {
  const token = localStorage.getItem('authToken')
  
  if (!token) {
    router.push('/login')
    return
  }

  try {
    // Busca os dados atualizados do backend
    const res = await fetch('https://iboxt.duckdns.org/api/profile', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    })

    if (res.ok) {
      const data = await res.json()
      user.value = data
    } else {
      // Se der erro (ex: token expirado), desloga
      handleLogout() 
    }
  } catch (error) {
    console.error('Erro ao carregar perfil:', error)
  } finally {
    isLoading.value = false
  }
}

// Função de Logout
const handleLogout = async () => {
  const token = localStorage.getItem('authToken')

  try {
    // Avisa o backend para invalidar o token (Blacklist)
    await fetch('https://iboxt.duckdns.org/api/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    })
  } catch (err) {
    console.error("Erro ao comunicar logout", err)
  }

  // Limpa tudo do navegador
  localStorage.removeItem('authToken')
  localStorage.removeItem('user') // Se tiver salvo algo
  
  // Redireciona
  router.push('/login')
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000000;
  padding: 20px;
}

.profile-card {
  background-color: #ffffff;
  border-radius: 30px;
  padding: 50px 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  position: relative;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.back-button svg {
    width: 24px;
    height: 24px;
}

.back-button:hover {
  background-color: #f0f0f0;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  background-color: #000000;
  border-radius: 50%;
  margin: 0 auto 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-avatar svg {
    width: 50px;
    height: 50px;
}

.profile-title {
  font-size: 28px;
  font-weight: 700;
  color: #000000;
  text-align: center;
  margin-bottom: 30px;
}

.profile-info {
  margin-bottom: 30px;
}

.info-group {
  margin-bottom: 20px;
}

.info-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #888;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  background-color: #fff;
  box-sizing: border-box; /* Importante para não quebrar layout */
}

.logout-button {
  width: 100%;
  padding: 16px;
  background-color: #ff3b30;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: #d32f2f;
}
</style>