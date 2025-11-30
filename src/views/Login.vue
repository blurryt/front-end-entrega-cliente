<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-circle">
        <div class="logo-shape"></div>
      </div>
      
      <h1 class="login-title">Login</h1>
      
      <form @submit.prevent="onLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="your-email@gmail.com"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="**********"
            required
          />
        </div>
        
        <button type="submit" class="login-button">Login</button>
      </form>
      
      <p class="signup-text">
        Don't have any account? <router-link to="/register" class="signup-link">Sign Up</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import API, { setAuthToken } from '../services/api'

const email = ref('')
const password = ref('')
const router = useRouter()

const onLogin = async () => {
    try {
        const res = await API.post('/login', {
            email: email.value,
            password: password.value
        })
        localStorage.setItem('authToken', res.data.token)
        if (res.data.user) {
            localStorage.setItem('user', JSON.stringify(res.data.user))
        }
        setAuthToken(res.data.token)
        router.push('/home')
    } catch (error) {
        console.error('Login failed:', error)
        if (error.response) {
            alert(`Erro: ${error.response.data.error || error.response.data.message || 'Erro ao fazer login'}`)
        } else {
            alert('Erro ao conectar com o servidor')
        }
    }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000000;
  padding: 20px;
}

.login-card {
  background-color: #ffffff;
  border-radius: 30px;
  padding: 50px 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.logo-circle {
  width: 80px;
  height: 80px;
  background-color: #000000;
  border-radius: 20px;
  margin: 0 auto 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-shape {
  width: 35px;
  height: 35px;
  background-color: #ffffff;
  border-radius: 50%;
}

.login-title {
  font-size: 32px;
  font-weight: 600;
  color: #000000;
  text-align: center;
  margin-bottom: 40px;
}

.login-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #000000;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  color: #000000;
  background-color: #ffffff;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #000000;
}

.form-group input::placeholder {
  color: #b0b0b0;
}

.login-button {
  width: 100%;
  padding: 16px;
  background-color: #000000;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #333333;
}

.signup-text {
  text-align: center;
  font-size: 14px;
  color: #666666;
}

.signup-link {
  color: #000000;
  font-weight: 600;
  text-decoration: none;
}

.signup-link:hover {
  text-decoration: underline;
}
</style>