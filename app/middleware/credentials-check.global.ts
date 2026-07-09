import type { Pinia } from 'pinia'
import type { NavigationGuard } from 'vue-router'
import { useCredentials } from '~/stores'

export const createCredentialsGuard =
  (pinia: Pinia): NavigationGuard =>
  (to) => {
    if (to.name === 'login') {
      return true
    }

    if (!useCredentials(pinia).credentials) {
      return { name: 'login' }
    }

    return true
  }

export default createCredentialsGuard
