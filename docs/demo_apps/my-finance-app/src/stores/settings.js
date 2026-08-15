import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    currency: {
      code: 'USD',
      symbol: '$',
      locale: 'en-US'
    },
    dateFormat: 'YYYY-MM-DD'
  }),
  actions: {
    setCurrency(currencyData) {
      this.currency = { ...this.currency, ...currencyData }
    },
    setDateFormat(format) {
      this.dateFormat = format
    }
  }
})
