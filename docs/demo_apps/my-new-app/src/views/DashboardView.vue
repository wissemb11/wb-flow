<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-icon">&#9670;</span>
        <span class="brand-text">SaaS App</span>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" active-class="active">
          <span class="nav-icon">&#9635;</span> Dashboard
        </router-link>
        <router-link to="/billing" class="nav-item" active-class="active">
          <span class="nav-icon">&#9830;</span> Billing
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="avatar">{{ auth.user?.name?.[0]?.toUpperCase() || '?' }}</div>
          <span class="user-name">{{ auth.user?.name || 'User' }}</span>
        </div>
        <button class="btn-logout" @click="handleLogout">Sign Out</button>
      </div>
    </aside>
    <main class="dashboard-main">
      <header class="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <p class="header-subtitle">Here's what's happening with your app today.</p>
      </header>
      <div class="stats-grid">
        <div class="stat-card">
          <p class="stat-label">Monthly Revenue</p>
          <p class="stat-value">$48,290</p>
          <p class="stat-change positive">+12.5% from last month</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Active Users</p>
          <p class="stat-value">2,847</p>
          <p class="stat-change positive">+8.2% from last month</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Conversion Rate</p>
          <p class="stat-value">3.24%</p>
          <p class="stat-change negative">-0.4% from last month</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Avg. Session</p>
          <p class="stat-value">4m 32s</p>
          <p class="stat-change positive">+1.1% from last month</p>
        </div>
      </div>
      <div class="charts-grid">
        <div class="chart-card">
          <h2>Monthly Recurring Revenue</h2>
          <div class="chart-placeholder">
            <canvas ref="mrrChart"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <h2>Traffic Sources</h2>
          <div class="chart-placeholder">
            <canvas ref="trafficChart"></canvas>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const auth = useAuthStore()
const router = useRouter()
const mrrChart = ref(null)
const trafficChart = ref(null)

function handleLogout() {
  auth.logout()
  router.push('/login')
}

const mrrData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    label: 'MRR ($)',
    data: [32000, 35000, 38000, 42000, 45000, 48290],
    borderColor: '#aa3bff',
    backgroundColor: 'rgba(170, 59, 255, 0.1)',
    fill: true,
    tension: 0.4
  }]
}

const trafficData = {
  labels: ['Direct', 'Organic', 'Referral', 'Social', 'Email'],
  datasets: [{
    data: [35, 28, 18, 12, 7],
    backgroundColor: ['#aa3bff', '#6366f1', '#3b82f6', '#06b6d4', '#10b981']
  }]
}

onMounted(() => {
  if (mrrChart.value) {
    new Chart(mrrChart.value.getContext('2d'), {
      type: 'line',
      data: mrrData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, ticks: { callback: v => '$' + (v / 1000) + 'k' } }
        }
      }
    })
  }
  if (trafficChart.value) {
    new Chart(trafficChart.value.getContext('2d'), {
      type: 'doughnut',
      data: trafficData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    })
  }
})
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}
.sidebar {
  width: 240px;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  background: var(--bg);
}
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
  padding: 0 8px;
}
.brand-icon {
  font-size: 24px;
  color: var(--accent);
}
.brand-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-h);
}
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text);
  font-size: 15px;
  transition: all 0.2s;
}
.nav-item:hover {
  background: var(--accent-bg);
  color: var(--text-h);
}
.nav-item.active {
  background: var(--accent-bg);
  color: var(--accent);
  font-weight: 500;
}
.nav-icon {
  font-size: 18px;
}
.sidebar-footer {
  border-top: 1px solid var(--border);
  padding-top: 16px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}
.user-name {
  font-size: 14px;
  color: var(--text-h);
}
.btn-logout {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-logout:hover {
  background: var(--accent-bg);
  border-color: var(--accent-border);
}
.dashboard-main {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}
.dashboard-header {
  margin-bottom: 32px;
}
.dashboard-header h1 {
  font-size: 28px;
  margin: 0 0 8px;
  color: var(--text-h);
}
.header-subtitle {
  color: var(--text);
  margin: 0;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}
.stat-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  background: var(--bg);
}
.stat-label {
  font-size: 14px;
  color: var(--text);
  margin: 0 0 8px;
}
.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-h);
  margin: 0 0 4px;
}
.stat-change {
  font-size: 13px;
  margin: 0;
}
.stat-change.positive {
  color: #10b981;
}
.stat-change.negative {
  color: #ef4444;
}
.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}
.chart-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  background: var(--bg);
}
.chart-card h2 {
  font-size: 16px;
  color: var(--text-h);
  margin: 0 0 16px;
}
.chart-placeholder {
  position: relative;
  height: 280px;
}
@media (max-width: 1024px) {
  .sidebar {
    width: 64px;
    padding: 24px 8px;
  }
  .brand-text, .nav-item span:last-child, .user-name {
    display: none;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .dashboard-main {
    padding: 16px;
  }
}
</style>