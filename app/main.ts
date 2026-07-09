import '@fontsource-variable/dm-sans'
import '@vueform/slider/themes/default.css'
import 'tippy.js/dist/tippy.css'

import { createHead } from '@unhead/vue/client'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import VueTippy from 'vue-tippy'
import VueSortable from 'vue3-sortablejs'

import App from '~/App.vue'
import { createCredentialsGuard } from '~/middleware/credentials-check.global'
import { router } from '~/router'
import { showError } from '~/runtime/app'

const app = createApp(App)
const pinia = createPinia()
const head = createHead()
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
})

app.use(pinia)
app.use(router)
app.use(head)
app.use(i18n)
app.use(VueTippy)
app.use(VueSortable)

app.directive('focus', {
  mounted: (element: HTMLElement, { value = true }) => nextTick(() => value && element.focus()),
})

router.beforeEach(createCredentialsGuard(pinia))
router.onError(showError)
app.config.errorHandler = showError

app.mount('#app')
