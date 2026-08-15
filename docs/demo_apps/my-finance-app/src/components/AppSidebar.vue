<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const links = [
  { path: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/transactions', label: 'Transactions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { path: '/budget', label: 'Budget', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' },
  { path: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
]
</script>

<template>
  <aside class="sidebar-container">
    <div class="logo-area">
      <div class="logo-icon">💸</div>
      <h2 class="logo-text">Finance Flow</h2>
    </div>
    
    <nav class="nav-menu">
      <router-link 
        v-for="link in links" 
        :key="link.path" 
        :to="link.path"
        class="nav-item"
        active-class="nav-item-active"
      >
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="link.icon"></path>
        </svg>
        <span class="nav-label">{{ link.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  padding: var(--space-4);
  height: 100%;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  margin-bottom: var(--space-6);
}

.logo-icon {
  font-size: 1.5rem;
  background: var(--accent-bg);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  border: 1px solid var(--accent-base);
}

.logo-text {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--slate-50), var(--slate-300));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.nav-icon {
  width: 20px;
  height: 20px;
  opacity: 0.8;
}

.nav-item-active {
  background-color: var(--accent-bg);
  color: var(--accent-base);
  border-right: 3px solid var(--accent-base);
}

.nav-item-active .nav-icon {
  opacity: 1;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .sidebar-container {
    padding: var(--space-2);
    justify-content: center;
  }
  
  .logo-area {
    display: none;
  }
  
  .nav-menu {
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
    gap: 0;
  }
  
  .nav-item {
    flex-direction: column;
    padding: var(--space-2);
    gap: var(--space-1);
    font-size: 0.65rem;
    flex: 1;
    text-align: center;
  }
  
  .nav-item-active {
    border-right: none;
    border-bottom: 2px solid var(--accent-base);
    background-color: transparent;
  }
}
</style>
