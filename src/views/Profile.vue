<template>
  <div class="profile-container">
    <div class="profile-card">
      <button @click="goBack" class="back-button">
        <svg width="128px" height="128px" viewBox="0 0 1024 1024" class="icon" version="1.1"
          xmlns="http://www.w3.org/2000/svg" fill="#000000">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z" fill="#000000"></path>
          </g>
        </svg>
      </button>

      <div class="profile-avatar">
        <svg width="80" height="80" viewBox="-6 -6 32.00 32.00" version="1.1" xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ffffff">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <g id="Page-1" stroke-width="0.0002" fill="none" fill-rule="evenodd">
              <g id="Dribbble-Light-Preview" transform="translate(-140.000000, -2159.000000)" fill="#ffffff">
                <g id="icons" transform="translate(56.000000, 160.000000)">
                  <path
                    d="M100.562548,2016.99998 L87.4381713,2016.99998 C86.7317804,2016.99998 86.2101535,2016.30298 86.4765813,2015.66198 C87.7127655,2012.69798 90.6169306,2010.99998 93.9998492,2010.99998 C97.3837885,2010.99998 100.287954,2012.69798 101.524138,2015.66198 C101.790566,2016.30298 101.268939,2016.99998 100.562548,2016.99998 M89.9166645,2004.99998 C89.9166645,2002.79398 91.7489936,2000.99998 93.9998492,2000.99998 C96.2517256,2000.99998 98.0830339,2002.79398 98.0830339,2004.99998 C98.0830339,2007.20598 96.2517256,2008.99998 93.9998492,2008.99998 C91.7489936,2008.99998 89.9166645,2007.20598 89.9166645,2004.99998 M103.955674,2016.63598 C103.213556,2013.27698 100.892265,2010.79798 97.837022,2009.67298 C99.4560048,2008.39598 100.400241,2006.33098 100.053171,2004.06998 C99.6509769,2001.44698 97.4235996,1999.34798 94.7348224,1999.04198 C91.0232075,1998.61898 87.8750721,2001.44898 87.8750721,2004.99998 C87.8750721,2006.88998 88.7692896,2008.57398 90.1636971,2009.67298 C87.1074334,2010.79798 84.7871636,2013.27698 84.044024,2016.63598 C83.7745338,2017.85698 84.7789973,2018.99998 86.0539717,2018.99998 L101.945727,2018.99998 C103.221722,2018.99998 104.226185,2017.85698 103.955674,2016.63598"
                    id="profile_round-[#1342]"></path>
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>

      <h1 class="profile-title">Profile</h1>

      <div class="profile-info">
        <div class="info-group">
          <label>First Name</label>
          <div class="info-value">{{ user.firstName || 'N/A' }}</div>
        </div>

        <div class="info-group">
          <label>Last Name</label>
          <div class="info-value">{{ user.lastName || 'N/A' }}</div>
        </div>

        <div class="info-group">
          <label>Email</label>
          <div class="info-value">{{ user.email || 'N/A' }}</div>
        </div>
      </div>

      <button @click="handleLogout" class="logout-button">Logout</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import API, { logout } from '../services/api'

const router = useRouter()
const user = ref({
  firstName: '',
  lastName: '',
  email: '',
  createdAt: ''
})

const goBack = () => {
  router.back()
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadUserData = async () => {
  // Primeiro tenta carregar do localStorage
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    user.value = JSON.parse(storedUser)
  }
  
  // Depois tenta atualizar do servidor
  try {
    const response = await API.get('/profile')
    user.value = response.data
    // Atualiza o localStorage com os dados mais recentes
    localStorage.setItem('user', JSON.stringify(response.data))
  } catch (error) {
    console.error('=== ERRO AO CARREGAR PERFIL ===')
    console.error('Status:', error.response?.status)
    console.error('Mensagem:', error.response?.data)
    console.error('Erro completo:', error)
    // Se já tem dados do localStorage, continua usando eles
    if (!storedUser) {
      console.error('Nenhum dado de usuário disponível')
    }
  }
}

const handleLogout = async () => {
  try {
    await logout()
    router.push('/login')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
    router.push('/login')
  }
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
  font-size: 28px;
  color: #000000;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-button:hover {
  opacity: 0.7;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  background-color: #000000;
  border-radius: 50%;
  margin: 0 auto 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-title {
  font-size: 32px;
  font-weight: 600;
  color: #000000;
  text-align: center;
  margin-bottom: 40px;
}

.profile-info {
  margin-bottom: 30px;
}

.info-group {
  margin-bottom: 25px;
}

.info-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #666666;
  margin-bottom: 8px;
}

.info-value {
  width: 100%;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  color: #000000;
  background-color: #f8f8f8;
}

.logout-button {
  width: 100%;
  padding: 16px;
  background-color: #d32f2f;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: #b71c1c;
}
</style>