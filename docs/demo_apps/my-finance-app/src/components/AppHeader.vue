<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useSettingsStore } from '../stores/settings'

const route = useRoute()
const settingsStore = useSettingsStore()

// Map route name to display title
const pageTitle = computed(() => {
  const name = route.name
  if (!name) return 'Loading...'
  return name.charAt(0).toUpperCase() + name.slice(1)
})

// Dynamic currency display
const currency = computed(() => `${settingsStore.currency.code} (${settingsStore.currency.symbol})`)
</script>

<template>
  <header class="header-container">
    <div class="page-info">
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>
    
    <div class="user-actions">
      <div class="currency-badge">
        <svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>{{ currency }}</span>
      </div>
      
      <div class="user-avatar">
        <span class="avatar-initials">WF</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--space-6);
  height: 100%;
}

.page-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.user-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.currency-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.badge-icon {
  width: 16px;
  height: 16px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--accent-base), var(--slate-600));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.user-avatar:hover {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 var(--space-4);
  }
}
</style>
