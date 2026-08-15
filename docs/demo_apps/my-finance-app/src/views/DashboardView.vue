<script setup>
import { computed, ref, onMounted } from 'vue'
import { useFinanceStore } from '../stores/finance'
import { useSettingsStore } from '../stores/settings'
import SpendingPieChart from '../components/charts/SpendingPieChart.vue'
import MonthlyBarChart from '../components/charts/MonthlyBarChart.vue'

const financeStore = useFinanceStore()
const settingsStore = useSettingsStore()

// Current month logic
const d = new Date()
const year = d.getFullYear()
const month = String(d.getMonth() + 1).padStart(2, '0')
const currentMonthKey = `${year}-${month}`

// Reactive formatting helper
const formatCurrency = (value) => {
  return new Intl.NumberFormat(settingsStore.currency.locale, { 
    style: 'currency', 
    currency: settingsStore.currency.code,
    maximumFractionDigits: 0
  }).format(value)
}

// Compute summary data
const totalBalance = computed(() => financeStore.totalBalance)
const monthlyIncome = computed(() => financeStore.monthlyIncome(currentMonthKey))
const monthlyExpenses = computed(() => financeStore.monthlyExpenses(currentMonthKey))

const savingsRate = computed(() => {
  const income = monthlyIncome.value
  const expenses = monthlyExpenses.value
  if (income === 0) return 0
  const rate = ((income - expenses) / income) * 100
  return Math.max(0, rate) // cap at 0 minimum
})

// Recent transactions (last 5)
const recentTransactions = computed(() => {
  return [...financeStore.transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
    .map(t => {
      const category = financeStore.categories.find(c => c.id === t.categoryId)
      return {
        ...t,
        categoryName: category ? category.name : 'Unknown',
        categoryColor: category ? category.color : '#94a3b8'
      }
    })
})

// Format date helper
const formatDate = (dateString) => {
  const d = new Date(dateString)
  return d.toLocaleDateString(settingsStore.currency.locale, { month: 'short', day: 'numeric' })
}

// Simple counter animation state
const loaded = ref(false)
onMounted(() => {
  setTimeout(() => { loaded.value = true }, 100)
})
</script>

<template>
  <div class="dashboard-container">
    <header class="mb-6">
      <h2 class="text-2xl font-semibold mb-1">Dashboard Overview</h2>
      <p class="text-secondary text-sm">Your financial snapshot for {{ new Date().toLocaleString('default', { month: 'long', year: 'numeric' }) }}</p>
    </header>

    <!-- Summary Cards -->
    <div class="grid cards-grid mb-6">
      <!-- Total Balance -->
      <div class="glass-card summary-card" :class="{ 'card-loaded': loaded }">
        <div class="card-header">
          <h3 class="card-title">Total Balance</h3>
          <div class="icon-wrapper accent">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
          </div>
        </div>
        <div class="card-value">{{ formatCurrency(totalBalance) }}</div>
      </div>

      <!-- Income -->
      <div class="glass-card summary-card" :class="{ 'card-loaded': loaded }" style="transition-delay: 50ms;">
        <div class="card-header">
          <h3 class="card-title">Monthly Income</h3>
          <div class="icon-wrapper income">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
        </div>
        <div class="card-value text-income">{{ formatCurrency(monthlyIncome) }}</div>
      </div>

      <!-- Expenses -->
      <div class="glass-card summary-card" :class="{ 'card-loaded': loaded }" style="transition-delay: 100ms;">
        <div class="card-header">
          <h3 class="card-title">Monthly Expenses</h3>
          <div class="icon-wrapper expense">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
          </div>
        </div>
        <div class="card-value text-expense">{{ formatCurrency(monthlyExpenses) }}</div>
      </div>

      <!-- Savings Rate -->
      <div class="glass-card summary-card" :class="{ 'card-loaded': loaded }" style="transition-delay: 150ms;">
        <div class="card-header">
          <h3 class="card-title">Savings Rate</h3>
          <div class="icon-wrapper" :class="savingsRate > 20 ? 'income' : (savingsRate > 5 ? 'budget' : 'expense')">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
        <div class="card-value">{{ savingsRate.toFixed(1) }}%</div>
      </div>
    </div>

    <!-- Charts & Lists Grid -->
    <div class="grid charts-grid">
      <!-- Monthly Trend -->
      <div class="glass-card panel">
        <h3 class="panel-title">Income & Expenses (6 Months)</h3>
        <div class="chart-wrapper">
          <MonthlyBarChart />
        </div>
      </div>

      <!-- Spending Breakdown -->
      <div class="glass-card panel">
        <h3 class="panel-title">Spending by Category</h3>
        <div class="chart-wrapper">
          <SpendingPieChart :monthKey="currentMonthKey" />
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="glass-card panel recent-tx-panel">
        <div class="flex justify-between items-center mb-4">
          <h3 class="panel-title m-0">Recent Transactions</h3>
          <router-link to="/transactions" class="view-all-link">View All</router-link>
        </div>
        
        <div v-if="recentTransactions.length === 0" class="empty-state">
          No recent transactions found.
        </div>
        
        <div v-else class="tx-list">
          <div v-for="tx in recentTransactions" :key="tx.id" class="tx-item">
            <div class="tx-left">
              <div class="category-dot" :style="{ backgroundColor: tx.categoryColor }"></div>
              <div class="tx-details">
                <div class="tx-desc">{{ tx.description }}</div>
                <div class="tx-meta">{{ tx.categoryName }} • {{ formatDate(tx.date) }}</div>
              </div>
            </div>
            <div class="tx-amount" :class="tx.type === 'income' ? 'text-income' : ''">
              {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
}

.mb-1 { margin-bottom: var(--space-1); }
.mb-4 { margin-bottom: var(--space-4); }
.mb-6 { margin-bottom: var(--space-6); }
.m-0 { margin: 0; }
.text-2xl { font-size: 1.5rem; }

.grid {
  display: grid;
  gap: var(--space-4);
}

.cards-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.charts-grid {
  grid-template-columns: repeat(12, 1fr);
  grid-auto-flow: dense;
}

/* Summary Cards */
.summary-card {
  padding: var(--space-4);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.4s ease-out, transform 0.4s ease-out, box-shadow var(--transition-normal);
}

.summary-card.card-loaded {
  opacity: 1;
  transform: translateY(0);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-3);
}

.card-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  color: white;
}

.icon-wrapper svg { width: 18px; height: 18px; }

.icon-wrapper.accent { background-color: var(--accent-base); }
.icon-wrapper.income { background-color: var(--income-base); }
.icon-wrapper.expense { background-color: var(--expense-base); }
.icon-wrapper.budget { background-color: var(--budget-base); }

.card-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

.text-income { color: var(--income-base); }
.text-expense { color: var(--expense-base); }

/* Panels */
.panel {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
}

.panel:nth-child(1) { grid-column: span 8; }
.panel:nth-child(2) { grid-column: span 4; }
.panel.recent-tx-panel { grid-column: span 12; }

@media (max-width: 1024px) {
  .panel:nth-child(1), .panel:nth-child(2) {
    grid-column: span 12;
  }
}

.panel-title {
  font-size: 1rem;
  margin-bottom: var(--space-4);
}

.chart-wrapper {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Recent TX List */
.view-all-link {
  font-size: 0.875rem;
  font-weight: 500;
}

.tx-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.tx-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
  transition: background-color var(--transition-fast);
}

.tx-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: var(--border-subtle);
}

.tx-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.category-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
}

.tx-details {
  display: flex;
  flex-direction: column;
}

.tx-desc {
  font-weight: 500;
  font-size: 0.95rem;
}

.tx-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.tx-amount {
  font-weight: 600;
  font-size: 0.95rem;
}

.empty-state {
  text-align: center;
  padding: var(--space-6) 0;
  color: var(--text-muted);
  font-style: italic;
}
</style>
