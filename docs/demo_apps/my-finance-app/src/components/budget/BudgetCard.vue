<script setup>
import { ref, computed } from 'vue'
import { useFinanceStore } from '../../stores/finance'
import { useSettingsStore } from '../../stores/settings'

const props = defineProps({
  budget: {
    type: Object,
    required: true
  }
})

const financeStore = useFinanceStore()
const settingsStore = useSettingsStore()

// Custom autofocus directive
const vFocus = {
  mounted: (el) => el.focus()
}

const category = computed(() => financeStore.categories.find(c => c.id === props.budget.categoryId))

const isEditing = ref(false)
const editLimit = ref(props.budget.limit)

const startEdit = () => {
  editLimit.value = props.budget.limit
  isEditing.value = true
}

const saveLimit = () => {
  if (editLimit.value > 0) {
    financeStore.setBudget(props.budget.categoryId, props.budget.monthKey, parseFloat(editLimit.value))
  }
  isEditing.value = false
}

const cancelEdit = () => {
  isEditing.value = false
}

const progressColor = computed(() => {
  const p = props.budget.utilizationPercentage
  if (p >= 90) return 'var(--expense-base)'
  if (p >= 75) return 'var(--budget-base)'
  return 'var(--income-base)'
})

const formatCurrency = (val) => {
  return new Intl.NumberFormat(settingsStore.currency.locale, { 
    style: 'currency', 
    currency: settingsStore.currency.code,
    maximumFractionDigits: 0
  }).format(val)
}
</script>

<template>
  <div class="glass-card budget-card">
    <div class="card-header">
      <div class="category-info">
        <div class="cat-icon" :style="{ backgroundColor: `${category?.color}20`, color: category?.color }">
          {{ category?.icon }}
        </div>
        <h4 class="cat-name">{{ category?.name }}</h4>
      </div>
      
      <div class="limit-info">
        <div v-if="!isEditing" class="limit-display" @click="startEdit" title="Click to edit">
          {{ formatCurrency(budget.limit) }}
          <svg class="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
        </div>
        <div v-else class="limit-edit">
          <span class="currency">{{ settingsStore.currency.symbol }}</span>
          <input type="number" v-model="editLimit" min="1" step="1" @keyup.enter="saveLimit" @keyup.esc="cancelEdit" v-focus />
          <button class="save-btn" @click="saveLimit">✓</button>
        </div>
      </div>
    </div>

    <div class="progress-container">
      <div class="progress-bar-bg">
        <div class="progress-fill" 
             :style="{ width: `${Math.min(budget.utilizationPercentage, 100)}%`, backgroundColor: progressColor }">
        </div>
      </div>
    </div>

    <div class="card-footer">
      <span class="spent">Spent: {{ formatCurrency(budget.spent) }}</span>
      <span class="remaining" :class="{ 'text-expense': budget.remaining < 0 }">
        {{ budget.remaining >= 0 ? 'Remaining' : 'Over' }}: {{ formatCurrency(Math.abs(budget.remaining)) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.budget-card {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.cat-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.cat-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.limit-display {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.limit-display:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.edit-icon {
  width: 14px;
  height: 14px;
  color: var(--text-muted);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.limit-display:hover .edit-icon {
  opacity: 1;
}

.limit-edit {
  display: flex;
  align-items: center;
  background-color: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--accent-base);
  border-radius: var(--radius-md);
  padding: 2px;
}

.currency {
  padding-left: var(--space-2);
  color: var(--text-secondary);
}

.limit-edit input {
  width: 80px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-family: inherit;
  font-weight: 600;
  padding: 4px;
}

.limit-edit input:focus { outline: none; }

.save-btn {
  background-color: var(--accent-base);
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.progress-container {
  width: 100%;
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.5s var(--ease-spring), background-color 0.3s ease;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.spent { color: var(--text-secondary); }
.remaining { font-weight: 500; }
.text-expense { color: var(--expense-base); }
</style>
