import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)

  function login(email, password) {
    user.value = { email, name: email.split('@')[0] }
    return true
  }

  function register(email, password, name) {
    user.value = { email, name }
    return true
  }

  function logout() {
    user.value = null
  }

  return { user, isAuthenticated, login, register, logout }
})