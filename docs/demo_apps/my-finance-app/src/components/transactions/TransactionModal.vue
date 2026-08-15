<script setup>
import { ref, watch } from 'vue'
import { useFinanceStore } from '../../stores/finance'
import { useSettingsStore } from '../../stores/settings'

const props = defineProps({
  isOpen: Boolean,
  transaction: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])
const financeStore = useFinanceStore()
const settingsStore = useSettingsStore()

// Form state
const type = ref('expense')
const amount = ref('')
const description = ref('')
const date = ref(new Date().toISOString().split('T')[0])
const categoryId = ref('')

// Watch for edit mode vs new mode
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.transaction) {
      // Edit mode
      type.value = props.transaction.type
      amount.value = props.transaction.amount
      description.value = props.transaction.description
      date.value = props.transaction.date
      categoryId.value = props.transaction.categoryId
    } else {
      // New mode
      type.value = 'expense'
      amount.value = ''
      description.value = ''
      date.value = new Date().toISOString().split('T')[0]
      categoryId.value = financeStore.categories.length > 0 ? financeStore.categories[0].id : ''
    }
  }
})

const handleSubmit = () => {
  if (!amount.value || amount.value <= 0 || !description.value || !categoryId.value || !date.value) {
    alert('Please fill all fields correctly.')
    return
  }

  const payload = {
    type: type.value,
    amount: parseFloat(amount.value),
    description: description.value,
    date: date.value,
    categoryId: categoryId.value
  }

  if (props.transaction) {
    financeStore.updateTransaction(props.transaction.id, payload)
  } else {
    financeStore.addTransaction(payload)
  }

  emit('save')
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="glass-card modal-content">
      <header class="modal-header">
        <h3 class="m-0">{{ transaction ? 'Edit Transaction' : 'Add Transaction' }}</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </header>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Type Toggle -->
        <div class="form-group type-toggle">
          <button type="button" 
                  class="toggle-btn" 
                  :class="{ active: type === 'expense' }"
                  @click="type = 'expense'">
            Expense
          </button>
          <button type="button" 
                  class="toggle-btn" 
                  :class="{ active: type === 'income' }"
                  @click="type = 'income'">
            Income
          </button>
        </div>

        <!-- Amount -->
        <div class="form-group">
          <label>Amount</label>
          <div class="amount-input-wrapper">
            <span class="currency-symbol">{{ settingsStore.currency.symbol }}</span>
            <input type="number" v-model="amount" step="0.01" min="0.01" required placeholder="0.00" class="form-input amount-input" />
          </div>
        </div>

        <!-- Description -->
        <div class="form-group">
          <label>Description</label>
          <input type="text" v-model="description" required placeholder="What was this for?" class="form-input" />
        </div>

        <!-- Date & Category Row -->
        <div class="form-row">
          <div class="form-group flex-1">
            <label>Date</label>
            <input type="date" v-model="date" required class="form-input" />
          </div>
          
          <div class="form-group flex-1">
            <label>Category</label>
            <select v-model="categoryId" required class="form-input">
              <option v-for="cat in financeStore.categories" :key="cat.id" :value="cat.id">
                {{ cat.icon }} {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-ghost" @click="$emit('close')">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Transaction</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(2, 6, 23, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-content {
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 var(--space-1);
}

.close-btn:hover { color: var(--text-primary); }

.modal-body {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-row {
  display: flex;
  gap: var(--space-4);
}

.flex-1 { flex: 1; min-width: 0; }

.form-input {
  width: 100%;
  padding: var(--space-3);
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
  box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.2);
}

/* Type Toggle */
.type-toggle {
  flex-direction: row;
  background-color: rgba(15, 23, 42, 0.5);
  padding: 4px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
}

.toggle-btn {
  flex: 1;
  padding: var(--space-2);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toggle-btn.active {
  background-color: var(--bg-surface-hover);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

/* Amount Input */
.amount-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: var(--space-3);
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 1.1rem;
}

.amount-input {
  padding-left: 2rem;
  font-size: 1.1rem;
  font-weight: 600;
}

/* Footer Buttons */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.btn {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.btn-primary {
  background-color: var(--accent-base);
  color: white;
}

.btn-primary:hover {
  background-color: #8b5cf6; /* violet-500 */
}
</style>
