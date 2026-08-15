<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useFinanceStore } from '../../stores/finance'
import { useSettingsStore } from '../../stores/settings'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  monthKey: {
    type: String,
    required: true
  }
})

const financeStore = useFinanceStore()
const settingsStore = useSettingsStore()

const chartData = computed(() => {
  const spending = financeStore.spendingByCategory(props.monthKey)
  const categories = financeStore.categories.filter(c => spending[c.id])
  
  if (categories.length === 0) {
    return {
      labels: ['No Data'],
      datasets: [{
        data: [1],
        backgroundColor: ['rgba(255, 255, 255, 0.1)'],
        borderColor: ['rgba(255, 255, 255, 0.2)'],
        borderWidth: 1
      }]
    }
  }

  return {
    labels: categories.map(c => c.name),
    datasets: [{
      data: categories.map(c => spending[c.id]),
      backgroundColor: categories.map(c => c.color),
      borderColor: 'rgba(15, 23, 42, 0.8)', // matches slate-900 surface
      borderWidth: 2,
      hoverOffset: 4
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: '#cbd5e1', // slate-300
        usePointStyle: true,
        padding: 20,
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
          if (context.label === 'No Data') return ' No spending this month'
          let label = context.label || ''
          if (label) {
            label += ': '
          }
          if (context.parsed !== null) {
            label += new Intl.NumberFormat(settingsStore.currency.locale, { 
              style: 'currency', 
              currency: settingsStore.currency.code 
            }).format(context.parsed)
          }
          return label
        }
      }
    }
  }
}
</script>

<template>
  <div class="chart-container">
    <Doughnut :data="chartData" :options="chartOptions" />
    <div class="center-text" v-if="chartData.labels[0] !== 'No Data'">
      <span class="center-label">Total</span>
      <span class="center-value">{{ 
        new Intl.NumberFormat(settingsStore.currency.locale, { 
          style: 'currency', 
          currency: settingsStore.currency.code,
          maximumFractionDigits: 0
        }).format(financeStore.monthlyExpenses(monthKey))
      }}</span>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  height: 250px;
  width: 100%;
}

.center-text {
  position: absolute;
  top: 50%;
  left: calc(25% + 10px); /* rough center of doughnut, accounting for right legend */
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

@media (max-width: 768px) {
  .center-text {
    left: 50%;
    top: 40%; /* adjusted for bottom legend on mobile */
  }
}

.center-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.center-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}
</style>
