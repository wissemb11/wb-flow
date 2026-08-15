const STORAGE_KEY = 'my_finance_app_data'
const SCHEMA_VERSION = 1

export function persistencePlugin({ store }) {
  // Only persist the finance and settings stores
  if (['finance', 'settings'].includes(store.$id)) {
    
    // Load existing state from localStorage on init
    const storedState = localStorage.getItem(STORAGE_KEY)
    
    if (storedState) {
      try {
        const parsed = JSON.parse(storedState)
        // Check schema version. If it matches, hydrate the specific store
        if (parsed._version === SCHEMA_VERSION && parsed[store.$id]) {
          store.$patch(parsed[store.$id])
        }
      } catch (e) {
        console.error('Failed to parse stored finance data:', e)
      }
    }

    // Subscribe to changes and debounce saving to localStorage
    let timeoutId = null
    
    store.$subscribe((mutation, state) => {
      if (timeoutId) clearTimeout(timeoutId)
      
      timeoutId = setTimeout(() => {
        // Read current state from localStorage (or init new object)
        const currentData = localStorage.getItem(STORAGE_KEY)
        let dataToSave = { _version: SCHEMA_VERSION }
        
        if (currentData) {
          try {
            const parsed = JSON.parse(currentData)
            if (parsed._version === SCHEMA_VERSION) {
              dataToSave = parsed
            }
          } catch (e) {
            // Ignore, we will overwrite
          }
        }
        
        // Update the specific store's data
        dataToSave[store.$id] = state
        
        // Save back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
      }, 500) // 500ms debounce
    }, { detached: true })
  }
}
