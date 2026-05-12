<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Create Account</h1>
      <p class="auth-subtitle">Get started with your free account</p>
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input id="name" v-model="form.name" type="text" placeholder="Jane Doe" required />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="email" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="form.password" type="password" placeholder="Min 8 characters" required minlength="8" />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>
      <p class="auth-switch">
        Already have an account? <router-link to="/login">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const form = reactive({ name: '', email: '', password: '' })

async function handleRegister() {
  loading.value = true
  error.value = ''
  try {
    const ok = authStore.register(form.email, form.password, form.name)
    if (ok) {
      router.push('/dashboard')
    } else {
      error.value = 'Registration failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 24px;
}
.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 40px 32px;
}
.auth-card h1 {
  font-size: 24px;
  margin: 0 0 8px;
  color: var(--text-h);
}
.auth-subtitle {
  color: var(--text);
  margin: 0 0 32px;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--text-h);
}
.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 15px;
  background: var(--bg);
  color: var(--text-h);
  box-sizing: border-box;
}
.form-group input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-bg);
}
.error {
  color: #dc2626;
  font-size: 14px;
  margin: 0 0 16px;
}
.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background: var(--accent);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: var(--shadow);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.auth-switch {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--text);
}
.auth-switch a {
  color: var(--accent);
  text-decoration: none;
}
.auth-switch a:hover {
  text-decoration: underline;
}
</style>