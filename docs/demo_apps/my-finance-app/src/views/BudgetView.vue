<script setup>
import { ref, computed } from 'vue'
import { useFinanceStore } from '../stores/finance'
import { useSettingsStore } from '../stores/settings'
import BudgetCard from '../components/budget/BudgetCard.vue'

const financeStore = useFinanceStore()
const settingsStore = useSettingsStore()

// Month Selection
const currentDate = ref(new Date())

const currentMonthKey = computed(() => {
  const y = currentDate.value.getFullYear()
  const m = String(currentDate.value.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
})

const displayMonth = computed(() => {
  return currentDate.value.toLocaleString(settingsStore.currency.locale, { 
    month: 'long', year: 'numeric' 
  })
})

const prevMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

// Data Processing
const formatCurrency = (val) => {
  return new Intl.NumberFormat(settingsStore.currency.locale, { 
    style: 'currency', 
    currency: settingsStore.currency.code,
    maximumFractionDigits: 0
  }).format(val)
}

const budgetsWithData = computed(() => {
  return financeStore.budgetUtilization(currentMonthKey.value)
})

// Categories without a budget this month
const unbudgetedCategories = computed(() => {
  const budgetedIds = budgetsWithData.value.map(b => b.categoryId)
  return financeStore.categories.filter(c => !budgetedIds.includes(c.id))
})

// Unbudgeted spending
const unbudgetedSpending = computed(() => {
  const spending = financeStore.spendingByCategory(currentMonthKey.value)
  let total = 0
  unbudgetedCategories.value.forEach(c => {
    if (spending[c.id]) total += spending[c.id]
  })
  return total
})

// Summary Math
const summary = computed(() => {
  const totalBudgeted = budgetsWithData.value.reduce((sum, b) => sum + b.limit, 0)
  const totalSpentInBudgets = budgetsWithData.value.reduce((sum, b) => sum + b.spent, 0)
  const totalSpentOverall = financeStore.monthlyExpenses(currentMonthKey.value)
  
  const remainingOverall = totalBudgeted - totalSpentOverall
  const utilization = totalBudgeted > 0 ? (totalSpentOverall / totalBudgeted) * 100 : 0
  
  return {
    budgeted: totalBudgeted,
    spent: totalSpentOverall,
    spentInBudgets: totalSpentInBudgets,
    remaining: remainingOverall,
    utilization
  }
})

// Add Budget Flow
const isAddingBudget = ref(false)
const newBudgetCategory = ref('')
const newBudgetLimit = ref('')

const handleAddBudget = () => {
  if (newBudgetCategory.value && newBudgetLimit.value > 0) {
    financeStore.setBudget(
      newBudgetCategory.value, 
      currentMonthKey.value, 
      parseFloat(newBudgetLimit.value)
    )
    isAddingBudget.value = false
    newBudgetCategory.value = ''
    newBudgetLimit.value = ''
  }
}
</script>

<template>
  <div class="budget-container">
    <header class="page-header">
      <div>
        <h2 class="text-2xl font-semibold mb-1">Budget Tracker</h2>
        <p class="text-secondary text-sm">Keep your spending in check.</p>
      </div>
      
      <!-- Month Selector -->
      <div class="month-selector glass-card">
        <button class="nav-btn" @click="prevMonth">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <span class="month-display">{{ displayMonth }}</span>
        <button class="nav-btn" @click="nextMonth">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </header>

    <!-- Overall Summary -->
    <div class="glass-card summary-card mb-6">
      <div class="summary-stat">
        <span class="stat-label">Total Budgeted</span>
        <span class="stat-value">{{ formatCurrency(summary.budgeted) }}</span>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-stat">
        <span class="stat-label">Total Spent</span>
        <span class="stat-value">{{ formatCurrency(summary.spent) }}</span>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-stat">
        <span class="stat-label">Overall Remaining</span>
        <span class="stat-value" :class="{ 'text-expense': summary.remaining < 0 }">
          {{ formatCurrency(summary.remaining) }}
        </span>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid budget-grid">
      <BudgetCard 
        v-for="budget in budgetsWithData" 
        :key="budget.id" 
        :budget="budget" 
      />
      
      <!-- Add Budget Placeholder -->
      <div v-if="unbudgetedCategories.length > 0" class="add-budget-card glass-card">
        <div v-if="!isAddingBudget" class="add-prompt" @click="isAddingBudget = true">
          <div class="plus-icon">+</div>
          <span>Create New Budget</span>
        </div>
        
        <form v-else @submit.prevent="handleAddBudget" class="add-form">
          <select v-model="newBudgetCategory" required class="form-input">
            <option value="" disabled>Select Category</option>
            <option v-for="cat in unbudgetedCategories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
          <div class="amount-input-wrapper">
            <span class="currency-symbol">{{ settingsStore.currency.symbol }}</span>
            <input type="number" v-model="newBudgetLimit" required min="1" step="1" placeholder="Limit" class="form-input amount-input" />
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" @click="isAddingBudget = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Unbudgeted Spending Warning -->
    <div v-if="unbudgetedSpending > 0" class="unbudgeted-warning mt-6 glass-card">
      <div class="warning-icon">⚠️</div>
      <div class="warning-text">
        <h4>Unbudgeted Spending Detected</h4>
        <p>You have spent <strong>{{ formatCurrency(unbudgetedSpending) }}</strong> in categories that do not have a budget set for this month.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.budget-container {
  display: flex;
  flex-direction: column;
}

.mb-1 { margin-bottom: var(--space-1); }
.mb-6 { margin-bottom: var(--space-6); }
.mt-6 { margin-top: var(--space-6); }
.text-2xl { font-size: 1.5rem; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
  gap: var(--space-4);
}

/* Month Selector */
.month-selector {
  display: flex;
  align-items: center;
  padding: var(--space-1);
}

.nav-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.nav-btn svg { width: 20px; height: 20px; }

.month-display {
  font-weight: 600;
  width: 150px;
  text-align: center;
}

/* Summary Card */
.summary-card {
  display: flex;
  justify-content: space-between;
  padding: var(--space-5) var(--space-8);
}

.summary-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
}

.summary-divider {
  width: 1px;
  background-color: var(--border-subtle);
}

@media (max-width: 768px) {
  .summary-card {
    flex-direction: column;
    padding: var(--space-4);
    gap: var(--space-4);
  }
  .summary-divider {
    height: 1px;
    width: 100%;
  }
}

/* Grid */
.budget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
}

/* Add Budget Card */
.add-budget-card {
  border: 1px dashed var(--border-subtle);
  background-color: rgba(255, 255, 255, 0.02);
  min-height: 150px;
}

.add-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--space-3);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: var(--space-4);
}

.add-prompt:hover {
  color: var(--accent-base);
  background-color: rgba(167, 139, 250, 0.05);
}

.plus-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  height: 100%;
}

.form-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background-color: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-base);
}

.amount-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: var(--space-3);
  color: var(--text-secondary);
}

.amount-input {
  padding-left: 2rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: auto;
}

.btn {
  padding: 6px 12px;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
}

.btn-ghost { background: transparent; color: var(--text-secondary); }
.btn-ghost:hover { background: rgba(255, 255, 255, 0.05); color: var(--text-primary); }
.btn-primary { background-color: var(--accent-base); color: white; }

/* Unbudgeted Warning */
.unbudgeted-warning {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background-color: var(--budget-bg);
  border: 1px solid var(--budget-base);
}

.warning-icon {
  font-size: 2rem;
}

.warning-text h4 {
  margin: 0 0 var(--space-1) 0;
  color: var(--budget-base);
}

.warning-text p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.text-expense { color: var(--expense-base) !important; }
</style>
