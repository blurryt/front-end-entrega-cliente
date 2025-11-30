<template>
    <div class="register-container">
        <div class="register-card">
            <div class="header">
                <button @click="goBack" class="back-button">
                    <svg width="128px" height="128px" viewBox="0 0 1024 1024" class="icon" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" fill="#000000">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <path d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z"
                                fill="#000000"></path>
                        </g>
                    </svg>
                </button>
                <h1 class="register-title">Sign Up</h1>
            </div>

            <form @submit.prevent="onSubmit" class="register-form">
                <div class="form-group">
                    <label for="firstName">First name</label>
                    <input type="text" id="firstName" v-model="firstName" placeholder="First name" required />
                </div>

                <div class="form-group">
                    <label for="lastName">Last name</label>
                    <input type="text" id="lastName" v-model="lastName" placeholder="Last name" required />
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" v-model="email" placeholder="your-email@email.com" required />
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" v-model="password" placeholder="••••••••" required />
                </div>


                <button type="submit" class="register-button">Sign Up</button>
            </form>

            <p class="signin-text">
                Already have any account? <router-link to="/login" class="signin-link">Sign In</router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import API, { setAuthToken } from '../services/api'

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')

const router = useRouter()

const goBack = () => {
  router.back()
}

const onSubmit = async () => {
    try {
        const res = await API.post('/register', {
            firstName: firstName.value,
            lastName: lastName.value,
            email: email.value,
            password: password.value
        })
        localStorage.setItem('authToken', res.data.token)
        if (res.data.user) {
            localStorage.setItem('user', JSON.stringify(res.data.user))
        }
        setAuthToken(res.data.token)

        router.push('/')
    } catch (error) {
        console.error('Erro no registro:', error)
        if (error.response) {
            console.error('Resposta do servidor:', error.response.data)
            alert(`Erro: ${error.response.data.error || error.response.data.message || 'Erro ao registrar'}`)
        } else {
            alert('Erro ao conectar com o servidor')
        }
    }
}
</script>

<style scoped>
.register-container {
    min-height: 100vh;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #000000;
    padding: 20px;
}

.register-card {
    background-color: #ffffff;
    border-radius: 30px;
    padding: 50px 40px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.header {
    position: relative;
    margin-bottom: 40px;
}

.back-button {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
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

.register-title {
    font-size: 32px;
    font-weight: 600;
    color: #000000;
    text-align: center;
    margin: 0;
}

.register-form {
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

.register-button {
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

.register-button:hover {
    background-color: #333333;
}

.signin-text {
    text-align: center;
    font-size: 14px;
    color: #666666;
}

.signin-link {
    color: #000000;
    font-weight: 600;
    text-decoration: none;
}

.signin-link:hover {
    text-decoration: underline;
}
</style>