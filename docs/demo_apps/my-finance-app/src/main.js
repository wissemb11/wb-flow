import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { persistencePlugin } from './plugins/persistence'
import './style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

pinia.use(persistencePlugin)

app.use(pinia)
app.use(router)

app.mount('#app')
