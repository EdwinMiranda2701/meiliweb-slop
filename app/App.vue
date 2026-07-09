<template>
  <ErrorPage v-if="appError" :error="appError" />
  <template v-else>
    <div class="relative h-dvh">
      <RouterView v-slot="{ Component }">
        <Suspense>
          <component :is="Component" :key="pageKey" />
        </Suspense>
      </RouterView>
      <DebugMemory
        v-if="IS_DEV_MODE && config.public.debugMemoryUsage"
        class="absolute bottom-0 flex w-full items-center justify-center gap-4 pb-6 text-xs text-gray-600" />
    </div>
    <Toaster />
    <ConfirmationDialog v-if="confirmationDialog" v-bind="confirmationDialog" />
    <PromisifiedDialogs />
  </template>
</template>

<script setup lang="ts">
import { appError, showError } from '~/runtime/app'
import Toaster from '~/components/layout/toasts/Toaster.vue'
import ConfirmationDialog from '~/components/layout/ConfirmationDialog.vue'
import PromisifiedDialogs from '~/components/layout/dialogs/PromisifiedDialogs.vue'
import ErrorPage from '~/error.vue'
import { safeToRefs } from '~/utils'
import { useConfirmationDialog, useCredentials } from '~/stores'
import { toRefs } from 'vue'

const route = useRoute()
const { confirmationDialog } = safeToRefs(useConfirmationDialog())
const IS_DEV_MODE = import.meta.env.DEV
const config = useRuntimeConfig()
const { credentials } = toRefs(useCredentials())
const self: any = reactive({
  credentials,
  pageKey: computed(() => [route.fullPath, self.credentials?.id].join(':')),
})

const { pageKey } = toRefs(self)
onErrorCaptured((error) => {
  showError(error)
  return false
})

useHead({
  htmlAttrs: {
    class: 'h-dvh',
  },
  bodyAttrs: {
    class: 'h-full',
  },
  titleTemplate: (titleChunk) => {
    let appName = 'Meiliweb'
    if (self.credentials) {
      appName += ` - ${self.credentials.name || self.credentials.baseUri}`
    }
    return titleChunk ? `${titleChunk} | ${appName}` : appName
  },
})
</script>

<i18n global>
en:
  toasts:
    titles:
      error: An error occured.
      duplicateIndex: Copying {indexUid} to {newIndexUid}
      renameIndex: Renaming {indexUid} to {newIndexUid}
    texts:
      pleaseWait: Please wait...
      done: Done.
      canceledTask: Task was canceled.
      failedTask: Task failed.

  buttons:
    reset: Reset
    cancel: Cancel
    submit: Submit
</i18n>

<style>
@config '../tailwind.config.js';
@import 'tailwindcss';

@layer components {
  .form-input,
  .form-checkbox {
    @apply focus:border-primary-300 focus:ring-primary-600 rounded-md border-gray-300 shadow-sm focus:ring-2 focus:outline-none;
  }
  .form-checkbox {
    @apply text-primary-600 rounded-sm;
  }
}

body {
  font-family: 'DM Sans Variable', sans-serif;
}
</style>
