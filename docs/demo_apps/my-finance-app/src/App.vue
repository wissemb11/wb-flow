<script setup>
import AppSidebar from './components/AppSidebar.vue'
import AppHeader from './components/AppHeader.vue'
</script>

<template>
  <div class="app-layout">
    <AppSidebar class="app-sidebar" />
    <div class="app-content">
      <AppHeader class="app-header" />
      <main class="main-view">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style>
/* App Shell Layout */
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.app-sidebar {
  width: 250px;
  flex-shrink: 0;
  border-right: 1px solid var(--border-subtle);
  background-color: var(--bg-surface);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 10;
}

.app-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
}

.app-header {
  height: 64px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-subtle);
  background-color: var(--bg-surface);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 5;
}

.main-view {
  flex-grow: 1;
  padding: var(--space-6);
  overflow-y: auto;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }
  
  .app-sidebar {
    width: 100%;
    order: 2; /* Move to bottom */
    border-right: none;
    border-top: 1px solid var(--border-subtle);
    position: sticky;
    bottom: 0;
  }
  
  .app-content {
    order: 1;
  }
  
  .main-view {
    padding: var(--space-4);
  }
}
</style>
