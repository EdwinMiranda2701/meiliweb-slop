<template>
  <EmptyState
    :icon="requestHasFilters ? 'heroicons:magnifying-glass' : 'heroicons:document-magnifying-glass'"
    :title="requestHasFilters ? t('emptyResults') : t('emptyIndex')">
    <template v-if="!requestHasFilters" #actions>
      <Button
        :as="RouterLink"
        :to="`/indexes/${indexUid}/settings/import-documents`"
        theme="primary"
        icon="ph:upload-fill">
        {{ t('actions.importDocuments') }}
      </Button>
    </template>
  </EmptyState>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Button from '~/components/layout/forms/Button.vue'
import EmptyState from '~/components/layout/EmptyState.vue'
import { useI18n } from 'vue-i18n'

type Props = {
  indexUid: string
  requestHasFilters: boolean
}

defineProps<Props>()
const { t } = useI18n()
</script>

<i18n>
en:
  emptyIndex: Your index is empty.
  emptyResults: Your query produced no results.
  actions:
    importDocuments: Import documents
</i18n>
