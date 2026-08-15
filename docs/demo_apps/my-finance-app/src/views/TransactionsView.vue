<script setup>
import { ref, computed } from 'vue'
import { useFinanceStore } from '../stores/finance'
import { useSettingsStore } from '../stores/settings'
import TransactionModal from '../components/transactions/TransactionModal.vue'

const financeStore = useFinanceStore()
const settingsStore = useSettingsStore()

// State
const searchQuery = ref('')
const activeCategoryFilter = ref(null)
const sortBy = ref('date-desc') // date-desc, date-asc, amount-desc, amount-asc

const isModalOpen = ref(false)
const editingTransaction = ref(null)

// Formatters
const formatCurrency = (value) => {
  return new Intl.NumberFormat(settingsStore.currency.locale, { 
    style: 'currency', 
    currency: settingsStore.currency.code 
  }).format(value)
}

const formatDate = (dateString) => {
  const d = new Date(dateString)
  return d.toLocaleDateString(settingsStore.currency.locale, { 
    year: 'numeric', month: 'short', day: 'numeric' 
  })
}

// Derived data
const filteredAndSortedTransactions = computed(() => {
  let result = [...financeStore.transactions]

  // Filter by search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(t => {
      const category = financeStore.categories.find(c => c.id === t.categoryId)
      return t.description.toLowerCase().includes(q) || 
             (category && category.name.toLowerCase().includes(q))
    })
  }

  // Filter by category
  if (activeCategoryFilter.value) {
    result = result.filter(t => t.categoryId === activeCategoryFilter.value)
  }

  // Sort
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'date-desc': return new Date(b.date) - new Date(a.date)
      case 'date-asc': return new Date(a.date) - new Date(b.date)
      case 'amount-desc': return b.amount - a.amount
      case 'amount-asc': return a.amount - b.amount
      default: return 0
    }
  })

  // Map category info for display
  return result.map(t => {
    const category = financeStore.categories.find(c => c.id === t.categoryId)
    return {
      ...t,
      categoryName: category ? category.name : 'Unknown',
      categoryColor: category ? category.color : '#94a3b8'
    }
  })
})

const activeCategoryCount = computed(() => {
  if (!activeCategoryFilter.value) return filteredAndSortedTransactions.value.length
  return financeStore.transactions.filter(t => t.categoryId === activeCategoryFilter.value).length
})

// Actions
const openAddModal = () => {
  editingTransaction.value = null
  isModalOpen.value = true
}

const openEditModal = (transaction) => {
  editingTransaction.value = transaction
  isModalOpen.value = true
}

const deleteTransaction = (id) => {
  if (confirm('Are you sure you want to delete this transaction?')) {
    financeStore.deleteTransaction(id)
  }
}
</script>

<template>
  <div class="transactions-container">
    <!-- Header Area -->
    <header class="page-header">
      <div>
        <h2 class="text-2xl font-semibold mb-1">Transactions</h2>
        <p class="text-secondary text-sm">Manage your income and expenses.</p>
      </div>
      <button class="add-btn" @click="openAddModal">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        New Transaction
      </button>
    </header>

    <!-- Toolbar: Search, Filters, Sort -->
    <div class="toolbar">
      <div class="search-box">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <input type="text" v-model="searchQuery" placeholder="Search description or category..." class="search-input" />
      </div>
      
      <div class="sort-box">
        <select v-model="sortBy" class="sort-select">
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>
    </div>

    <!-- Category Filter Chips -->
    <div class="filter-chips">
      <button class="chip" 
              :class="{ active: activeCategoryFilter === null }"
              @click="activeCategoryFilter = null">
        All
      </button>
      <button v-for="cat in financeStore.categories" :key="cat.id"
              class="chip"
              :class="{ active: activeCategoryFilter === cat.id }"
              :style="activeCategoryFilter === cat.id ? { borderColor: cat.color, color: cat.color, backgroundColor: `${cat.color}20` } : {}"
              @click="activeCategoryFilter = activeCategoryFilter === cat.id ? null : cat.id">
        {{ cat.icon }} {{ cat.name }}
      </button>
    </div>

    <!-- Table -->
    <div class="glass-card table-container">
      <table class="tx-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th class="text-right">Amount</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody v-if="filteredAndSortedTransactions.length > 0">
          <tr v-for="tx in filteredAndSortedTransactions" :key="tx.id">
            <td class="col-date">{{ formatDate(tx.date) }}</td>
            <td class="col-desc">{{ tx.description }}</td>
            <td class="col-cat">
              <span class="category-badge" :style="{ backgroundColor: `${tx.categoryColor}20`, color: tx.categoryColor }">
                <span class="dot" :style="{ backgroundColor: tx.categoryColor }"></span>
                {{ tx.categoryName }}
              </span>
            </td>
            <td class="col-amount text-right font-semibold" :class="tx.type === 'income' ? 'text-income' : ''">
              {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
            </td>
            <td class="col-actions text-right">
              <button class="action-btn edit" @click="openEditModal(tx)" title="Edit">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
              <button class="action-btn delete" @click="deleteTransaction(tx.id)" title="Delete">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="5" class="empty-state">
              No transactions found matching your criteria.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <TransactionModal 
      :isOpen="isModalOpen" 
      :transaction="editingTransaction" 
      @close="isModalOpen = false" 
    />
  </div>
</template>

<style scoped>
.transactions-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mb-1 { margin-bottom: var(--space-1); }
.text-2xl { font-size: 1.5rem; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background-color: var(--accent-base);
  color: white;
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.add-btn:hover {
  background-color: #8b5cf6;
  transform: translateY(-1px);
}

.add-btn svg { width: 18px; height: 18px; }

/* Toolbar */
.toolbar {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.search-box {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) 2.5rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-base);
}

.sort-select {
  padding: var(--space-2) var(--space-3);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  min-width: 150px;
}

/* Filter Chips */
.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}

.chip {
  padding: 4px var(--space-3);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chip:hover {
  background-color: var(--bg-surface-hover);
  color: var(--text-primary);
}

.chip.active {
  background-color: var(--text-primary);
  color: var(--bg-body);
  border-color: var(--text-primary);
}

/* Table */
.table-container {
  overflow-x: auto;
}

.tx-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th {
  padding: var(--space-3) var(--space-4);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-subtle);
  background-color: rgba(255, 255, 255, 0.02);
}

td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
}

tr:last-child td { border-bottom: none; }

tr:hover td { background-color: rgba(255, 255, 255, 0.02); }

.col-date { color: var(--text-secondary); font-size: 0.875rem; width: 120px; }
.col-desc { font-weight: 500; }
.col-cat { width: 180px; }
.text-right { text-align: right; }
.text-income { color: var(--income-base); }

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.action-btn {
  background: none;
  border: none;
  padding: var(--space-1);
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast);
}

.action-btn svg { width: 18px; height: 18px; }

.action-btn.edit:hover { color: var(--text-primary); background-color: rgba(255, 255, 255, 0.1); }
.action-btn.delete:hover { color: var(--expense-base); background-color: var(--expense-bg); }

.empty-state {
  text-align: center;
  padding: var(--space-8);
  color: var(--text-muted);
  font-style: italic;
}

@media (max-width: 768px) {
  .toolbar { flex-direction: column; }
  .col-cat { display: none; } /* Hide category column on mobile */
  .col-date { font-size: 0.75rem; width: auto; }
}
</style>
