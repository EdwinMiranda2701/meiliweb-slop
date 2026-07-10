<template>
  <div class="grid justify-items-stretch gap-6 md:grid-cols-3">
    <DefineCard v-slot="{ $slots, title, icon }">
      <section class="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <span class="bg-primary-50 text-primary-700 flex size-11 shrink-0 items-center justify-center rounded-xl">
          <Icon :name="icon" class="size-6" />
        </span>
        <div class="min-w-0 space-y-1">
          <h2 class="block text-sm font-medium text-gray-500">{{ title }}</h2>
          <span class="block font-semibold tracking-tight break-words text-gray-900">
            <Component :is="$slots.default" />
          </span>
        </div>
      </section>
    </DefineCard>

    <Card :title="t('titles.version')" icon="material-symbols:conversion-path">
      {{ version.pkgVersion }}
    </Card>

    <Card :title="t('titles.dbSize')" icon="gravity-ui:database-fill">
      {{ filesize(stats.databaseSize).human() }}
    </Card>

    <Card :title="t('titles.lastUpdatedAt')" icon="bi:clock-fill">
      {{ formatDate(stats.lastUpdate) }}
    </Card>
  </div>
</template>

<script setup>
import { createReusableTemplate } from '@vueuse/core'
import filesize from 'file-size'
import { useDateFormatter, useMeiliClient } from '~/composables'

const [DefineCard, Card] = createReusableTemplate()
const meili = useMeiliClient()
const { t } = useI18n()
const { formatDate } = useDateFormatter()
const [version, stats] = await Promise.all([meili.getVersion(), meili.getStats()])
</script>

<i18n>
en:
  titles:
    dbSize: Database size
    version: Meilisearch Version
    lastUpdatedAt: Last updated
</i18n>
