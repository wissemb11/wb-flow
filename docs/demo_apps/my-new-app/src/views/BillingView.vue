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
    <main class="billing-main">
      <header class="billing-header">
        <h1>Billing & Subscription</h1>
        <p class="header-subtitle">Manage your subscription and payment details.</p>
      </header>

      <section class="current-plan">
        <div class="plan-info">
          <h2>Current Plan: <span class="plan-badge">Free</span></h2>
          <p>Basic analytics for small teams. Upgrade to unlock more features.</p>
        </div>
      </section>

      <section class="tiers">
        <div class="tier-card">
          <div class="tier-header">
            <h3>Basic</h3>
            <p class="tier-price">$9<span class="tier-period">/mo</span></p>
          </div>
          <ul class="tier-features">
            <li>&#10003; 5 dashboards</li>
            <li>&#10003; 1,000 data points</li>
            <li>&#10003; Email support</li>
            <li>&#10003; 7-day history</li>
          </ul>
          <button class="btn btn-outline" disabled>Current Plan</button>
        </div>

        <div class="tier-card tier-popular">
          <div class="popular-badge">Most Popular</div>
          <div class="tier-header">
            <h3>Pro</h3>
            <p class="tier-price">$29<span class="tier-period">/mo</span></p>
          </div>
          <ul class="tier-features">
            <li>&#10003; Unlimited dashboards</li>
            <li>&#10003; 100,000 data points</li>
            <li>&#10003; Priority support</li>
            <li>&#10003; 90-day history</li>
            <li>&#10003; Custom charts</li>
          </ul>
          <button class="btn btn-primary" @click="upgrade('pro')">Upgrade to Pro</button>
        </div>

        <div class="tier-card">
          <div class="tier-header">
            <h3>Enterprise</h3>
            <p class="tier-price">$99<span class="tier-period">/mo</span></p>
          </div>
          <ul class="tier-features">
            <li>&#10003; Everything in Pro</li>
            <li>&#10003; Unlimited data points</li>
            <li>&#10003; Dedicated account manager</li>
            <li>&#10003; 1-year history</li>
            <li>&#10003; SSO & audit logs</li>
          </ul>
          <button class="btn btn-outline" @click="upgrade('enterprise')">Contact Sales</button>
        </div>
      </section>

      <section class="payment-section">
        <h2>Payment Method</h2>
        <div class="payment-card">
          <div class="payment-placeholder">
            <span class="card-icon">&#128179;</span>
            <p>No payment method on file</p>
          </div>
          <button class="btn btn-outline btn-small" disabled title="Coming soon">Update Payment Method</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/login')
}

function upgrade(tier) {
  alert(`Upgrade to ${tier} — this is a mock action. No backend connected.`)
}
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
.billing-main {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}
.billing-header {
  margin-bottom: 32px;
}
.billing-header h1 {
  font-size: 28px;
  margin: 0 0 8px;
  color: var(--text-h);
}
.header-subtitle {
  color: var(--text);
  margin: 0;
}
.current-plan {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  background: var(--bg);
}
.plan-info h2 {
  margin: 0 0 8px;
  font-size: 20px;
  color: var(--text-h);
}
.plan-badge {
  background: var(--accent-bg);
  color: var(--accent);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 14px;
}
.plan-info p {
  margin: 0;
  color: var(--text);
}
.tiers {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}
.tier-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  background: var(--bg);
  position: relative;
}
.tier-popular {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent-border);
}
.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 12px;
}
.tier-header {
  margin-bottom: 16px;
}
.tier-header h3 {
  font-size: 20px;
  color: var(--text-h);
  margin: 0 0 8px;
}
.tier-price {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-h);
  margin: 0;
}
.tier-period {
  font-size: 16px;
  font-weight: 400;
  color: var(--text);
}
.tier-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--text);
}
.tier-features li {
  padding: 6px 0;
}
.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background: var(--accent);
  color: #fff;
}
.btn-primary:hover {
  filter: brightness(1.1);
}
.btn-outline {
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-outline:hover:not(:disabled) {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}
.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-small {
  width: auto;
  padding: 8px 16px;
  font-size: 14px;
}
.payment-section h2 {
  font-size: 20px;
  color: var(--text-h);
  margin: 0 0 16px;
}
.payment-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.payment-placeholder {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text);
}
.card-icon {
  font-size: 24px;
}
@media (max-width: 1024px) {
  .sidebar {
    width: 64px;
    padding: 24px 8px;
  }
  .brand-text, .nav-item span:last-child, .user-name {
    display: none;
  }
  .tiers {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .billing-main {
    padding: 16px;
  }
}
</style>