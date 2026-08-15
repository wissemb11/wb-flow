<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { useFinanceStore } from '../../stores/finance'
import { useSettingsStore } from '../../stores/settings'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const financeStore = useFinanceStore()
const settingsStore = useSettingsStore()

// Generate last 6 months keys
const getLast6Months = () => {
  const result = []
  const d = new Date()
  d.setDate(1) // Avoid edge cases at end of month
  
  for (let i = 5; i >= 0; i--) {
    const monthD = new Date(d)
    monthD.setMonth(d.getMonth() - i)
    
    const year = monthD.getFullYear()
    const month = String(monthD.getMonth() + 1).padStart(2, '0')
    const key = `${year}-${month}`
    
    const label = monthD.toLocaleString('default', { month: 'short' })
    result.push({ key, label })
  }
  return result
}

const chartData = computed(() => {
  const months = getLast6Months()
  
  return {
    labels: months.map(m => m.label),
    datasets: [
      {
        label: 'Income',
        backgroundColor: '#34d399', // emerald-400
        borderRadius: 4,
        data: months.map(m => financeStore.monthlyIncome(m.key))
      },
      {
        label: 'Expenses',
        backgroundColor: '#fb7185', // rose-400
        borderRadius: 4,
        data: months.map(m => financeStore.monthlyExpenses(m.key))
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false
      },
      ticks: {
        color: '#94a3b8',
        callback: function(value) {
          if (value === 0) return '0'
          return new Intl.NumberFormat(settingsStore.currency.locale, { 
            style: 'currency', 
            currency: settingsStore.currency.code,
            maximumFractionDigits: 0
          }).format(value)
        }
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        color: '#94a3b8'
      }
    }
  },
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        color: '#cbd5e1',
        usePointStyle: true,
        boxWidth: 8,
        font: {
          family: "'Inter', sans-serif",
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      titleColor: '#f8fafc',
      bodyColor: '#e2e8f0',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat(settingsStore.currency.locale, { 
              style: 'currency', 
              currency: settingsStore.currency.code 
            }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  }
}
</script>

<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  height: 250px;
  width: 100%;
}
</style>
