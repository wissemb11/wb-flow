import { defineStore } from 'pinia'

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 9)

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    transactions: [
      { id: generateId(), date: '2026-05-01', description: 'Salary', amount: 5000, type: 'income', categoryId: 'c1' },
      { id: generateId(), date: '2026-05-02', description: 'Groceries', amount: 150, type: 'expense', categoryId: 'c2' },
      { id: generateId(), date: '2026-05-03', description: 'Rent', amount: 1500, type: 'expense', categoryId: 'c3' },
      { id: generateId(), date: '2026-05-05', description: 'Coffee Shop', amount: 12.50, type: 'expense', categoryId: 'c4' },
      { id: generateId(), date: '2026-05-06', description: 'Freelance Design', amount: 800, type: 'income', categoryId: 'c1' },
      { id: generateId(), date: '2026-05-08', description: 'Internet Bill', amount: 80, type: 'expense', categoryId: 'c5' },
      // Previous month
      { id: generateId(), date: '2026-04-01', description: 'Salary', amount: 5000, type: 'income', categoryId: 'c1' },
      { id: generateId(), date: '2026-04-05', description: 'Rent', amount: 1500, type: 'expense', categoryId: 'c3' },
      { id: generateId(), date: '2026-04-12', description: 'Groceries', amount: 180, type: 'expense', categoryId: 'c2' },
      { id: generateId(), date: '2026-04-15', description: 'Electric Bill', amount: 95, type: 'expense', categoryId: 'c5' },
      { id: generateId(), date: '2026-04-22', description: 'Restaurant', amount: 65, type: 'expense', categoryId: 'c4' },
      { id: generateId(), date: '2026-04-28', description: 'Movie Tickets', amount: 30, type: 'expense', categoryId: 'c6' },
      // Two months ago
      { id: generateId(), date: '2026-03-01', description: 'Salary', amount: 5000, type: 'income', categoryId: 'c1' },
      { id: generateId(), date: '2026-03-05', description: 'Rent', amount: 1500, type: 'expense', categoryId: 'c3' },
      { id: generateId(), date: '2026-03-10', description: 'Groceries', amount: 140, type: 'expense', categoryId: 'c2' }
    ],
    categories: [
      { id: 'c1', name: 'Income', icon: '💰', color: '#34d399' },
      { id: 'c2', name: 'Food & Groceries', icon: '🛒', color: '#fb7185' },
      { id: 'c3', name: 'Housing', icon: '🏠', color: '#818cf8' },
      { id: 'c4', name: 'Dining Out', icon: '🍽️', color: '#f472b6' },
      { id: 'c5', name: 'Utilities', icon: '⚡', color: '#fbbf24' },
      { id: 'c6', name: 'Entertainment', icon: '🎬', color: '#a78bfa' }
    ],
    budgets: [
      { id: generateId(), categoryId: 'c2', monthKey: '2026-05', limit: 400 },
      { id: generateId(), categoryId: 'c4', monthKey: '2026-05', limit: 150 },
      { id: generateId(), categoryId: 'c5', monthKey: '2026-05', limit: 200 }
    ]
  }),
  getters: {
    totalBalance: (state) => {
      return state.transactions.reduce((total, t) => {
        return t.type === 'income' ? total + t.amount : total - t.amount
      }, 0)
    },
    monthlyIncome: (state) => {
      return (monthKey) => {
        return state.transactions
          .filter(t => t.type === 'income' && t.date.startsWith(monthKey))
          .reduce((sum, t) => sum + t.amount, 0)
      }
    },
    monthlyExpenses: (state) => {
      return (monthKey) => {
        return state.transactions
          .filter(t => t.type === 'expense' && t.date.startsWith(monthKey))
          .reduce((sum, t) => sum + t.amount, 0)
      }
    },
    spendingByCategory: (state) => {
      return (monthKey) => {
        const spending = {}
        state.transactions
          .filter(t => t.type === 'expense' && t.date.startsWith(monthKey))
          .forEach(t => {
            if (!spending[t.categoryId]) {
              spending[t.categoryId] = 0
            }
            spending[t.categoryId] += t.amount
          })
        return spending
      }
    },
    budgetUtilization: (state) => {
      return (monthKey) => {
        const spending = {}
        // calculate spending
        state.transactions
          .filter(t => t.type === 'expense' && t.date.startsWith(monthKey))
          .forEach(t => {
            if (!spending[t.categoryId]) spending[t.categoryId] = 0
            spending[t.categoryId] += t.amount
          })
          
        return state.budgets
          .filter(b => b.monthKey === monthKey)
          .map(b => {
            const spent = spending[b.categoryId] || 0
            return {
              ...b,
              spent,
              remaining: b.limit - spent,
              utilizationPercentage: (spent / b.limit) * 100
            }
          })
      }
    }
  },
  actions: {
    addTransaction(transaction) {
      this.transactions.push({
        ...transaction,
        id: generateId()
      })
    },
    updateTransaction(id, updates) {
      const index = this.transactions.findIndex(t => t.id === id)
      if (index !== -1) {
        this.transactions[index] = { ...this.transactions[index], ...updates }
      }
    },
    deleteTransaction(id) {
      this.transactions = this.transactions.filter(t => t.id !== id)
    },
    addCategory(category) {
      this.categories.push({
        ...category,
        id: `c${Date.now()}` // Simple ID generation for categories
      })
    },
    setBudget(categoryId, monthKey, limit) {
      const existingIndex = this.budgets.findIndex(b => b.categoryId === categoryId && b.monthKey === monthKey)
      if (existingIndex !== -1) {
        this.budgets[existingIndex].limit = limit
      } else {
        this.budgets.push({ id: generateId(), categoryId, monthKey, limit })
      }
    }
  }
})
