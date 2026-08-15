<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useFinanceStore } from '../stores/finance'

const settingsStore = useSettingsStore()
const financeStore = useFinanceStore()

const currencies = [
  { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro' },
  { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound' },
  { code: 'DZD', symbol: 'د.ج', locale: 'ar-DZ', name: 'Algerian Dinar' },
  { code: 'TND', symbol: 'د.ت', locale: 'ar-TN', name: 'Tunisian Dinar' },
  { code: 'MAD', symbol: 'د.م.', locale: 'ar-MA', name: 'Moroccan Dirham' }
]

const updateCurrency = (event) => {
  const selected = currencies.find(c => c.code === event.target.value)
  if (selected) {
    settingsStore.setCurrency(selected)
  }
}

// Category Management
const newCatName = ref('')
const newCatIcon = ref('💡')
const newCatColor = ref('#3b82f6')

const addCategory = () => {
  if (newCatName.value) {
    financeStore.addCategory({
      name: newCatName.value,
      icon: newCatIcon.value,
      color: newCatColor.value
    })
    newCatName.value = ''
    newCatIcon.value = '💡'
    newCatColor.value = '#3b82f6'
  }
}

const deleteCategory = (id) => {
  const txCount = financeStore.transactions.filter(t => t.categoryId === id).length
  if (txCount > 0) {
    alert(`Cannot delete category. There are ${txCount} transactions associated with it. Please reassign them first.`)
    return
  }
  
  if (confirm('Are you sure you want to delete this category?')) {
    financeStore.categories = financeStore.categories.filter(c => c.id !== id)
  }
}

// Data Management
const exportData = () => {
  const data = {
    settings: settingsStore.$state,
    finance: financeStore.$state
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `finance-export-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const importData = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (data.settings && data.finance) {
        settingsStore.$patch(data.settings)
        financeStore.$patch(data.finance)
        alert('Data imported successfully!')
      } else {
        alert('Invalid file format.')
      }
    } catch (err) {
      alert('Error parsing JSON file.')
    }
  }
  reader.readAsText(file)
}

const resetData = () => {
  if (confirm('Are you sure you want to completely reset all data? This will restore the initial demo transactions and settings. This cannot be undone.')) {
    localStorage.removeItem('my_finance_app_data')
    window.location.reload()
  }
}
</script>

<template>
  <div class="settings-container">
    <header class="page-header">
      <h2 class="text-2xl font-semibold mb-1">Settings</h2>
      <p class="text-secondary text-sm">Customize your application preferences.</p>
    </header>

    <div class="grid settings-grid">
      <!-- Preferences -->
      <div class="glass-card panel">
        <h3 class="panel-title">Preferences</h3>
        
        <div class="setting-group">
          <label class="setting-label">Display Currency</label>
          <select class="form-input" :value="settingsStore.currency.code" @change="updateCurrency">
            <option v-for="c in currencies" :key="c.code" :value="c.code">
              {{ c.code }} ({{ c.symbol }}) - {{ c.name }}
            </option>
          </select>
          <p class="setting-hint">All amounts will automatically re-format to match this locale.</p>
        </div>
      </div>

      <!-- Data Management -->
      <div class="glass-card panel">
        <h3 class="panel-title">Data Management</h3>
        
        <div class="data-actions">
          <button class="btn btn-secondary" @click="exportData">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export JSON Data
          </button>
          
          <label class="btn btn-outline import-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            Import JSON Data
            <input type="file" accept=".json" class="hidden-input" @change="importData">
          </label>
          
          <button class="btn btn-ghost" @click="resetData" style="color: var(--expense-base); margin-top: var(--space-4); border-color: var(--expense-base);">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Reset Demo Data
          </button>
        </div>
      </div>

      <!-- Categories -->
      <div class="glass-card panel categories-panel">
        <h3 class="panel-title">Manage Categories</h3>
        
        <!-- Add Category Form -->
        <form @submit.prevent="addCategory" class="add-cat-form mb-6">
          <input type="text" v-model="newCatIcon" class="form-input icon-input" placeholder="Icon" maxlength="2" required />
          <input type="text" v-model="newCatName" class="form-input flex-1" placeholder="New category name..." required />
          <input type="color" v-model="newCatColor" class="color-input" />
          <button type="submit" class="btn btn-primary">Add</button>
        </form>

        <!-- Category List -->
        <div class="cat-list">
          <div v-for="cat in financeStore.categories" :key="cat.id" class="cat-item">
            <div class="cat-info">
              <span class="cat-icon" :style="{ backgroundColor: `${cat.color}20`, color: cat.color }">
                {{ cat.icon }}
              </span>
              <span class="font-medium">{{ cat.name }}</span>
            </div>
            <button class="action-btn delete" @click="deleteCategory(cat.id)">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
}

.mb-1 { margin-bottom: var(--space-1); }
.mb-6 { margin-bottom: var(--space-6); }
.text-2xl { font-size: 1.5rem; }
.font-medium { font-weight: 500; }
.flex-1 { flex: 1; min-width: 0; }

.page-header {
  margin-bottom: var(--space-6);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--space-6);
}

.panel {
  padding: var(--space-5);
}

.categories-panel {
  grid-column: 1 / -1;
}

.panel-title {
  margin: 0 0 var(--space-4) 0;
  font-size: 1.1rem;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: var(--space-3);
}

/* Form Inputs */
.setting-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.setting-label {
  font-weight: 500;
  color: var(--text-primary);
}

.setting-hint {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.form-input {
  padding: var(--space-2) var(--space-3);
  background-color: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-base);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.btn svg { width: 18px; height: 18px; }

.btn-primary { background-color: var(--accent-base); color: white; }
.btn-primary:hover { background-color: #8b5cf6; }

.btn-secondary {
  background-color: var(--slate-700);
  color: white;
}
.btn-secondary:hover { background-color: var(--slate-600); }

.btn-outline {
  background-color: transparent;
  border-color: var(--border-subtle);
  color: var(--text-primary);
}
.btn-outline:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Data Actions */
.data-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.hidden-input {
  display: none;
}

.import-btn {
  width: 100%;
}

/* Categories */
.add-cat-form {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.icon-input {
  width: 50px;
  text-align: center;
}

.color-input {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  background: transparent;
}

.color-input::-webkit-color-swatch-wrapper { padding: 0; }
.color-input::-webkit-color-swatch { 
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

.cat-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--space-3);
}

.cat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

.cat-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.cat-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 1.1rem;
}

.action-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.action-btn svg { width: 18px; height: 18px; }
.action-btn.delete:hover {
  color: var(--expense-base);
  background-color: var(--expense-bg);
}
</style>
