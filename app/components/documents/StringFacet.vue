<template>
  <div class="space-y-4 pb-4">
    <header class="bg-gray-100 px-4 py-4 sm:px-6">
      <h3 class="text-md">{{ humanizeString(facet) }}</h3>
    </header>

    <div class="space-y-4 px-4 sm:px-6">
      <MultiCombobox
        v-model="pendingFacetValues"
        v-model:query="self.facetQuery"
        :items="availableFacetHits"
        :stringify="stringifyFacetHit"
        :unique-key="facetHitKey"
        :filter="keepServerResults"
        :input-attrs="{ placeholder: t('placeholder') }"
        hide-tags
        auto-hide
        class="block w-full">
        <template #default="{ item, active }">
          <li
            class="relative flex cursor-default items-center justify-between gap-4 rounded-lg px-3 py-2 select-none focus:outline-none"
            :class="active ? 'bg-primary-50 text-primary-900' : 'text-gray-900'">
            <span class="truncate">{{ item.value }}</span>
            <span class="shrink-0 text-xs text-gray-500">{{ item.count }}</span>
          </li>
        </template>
        <template #no-options>
          <li role="presentation" class="px-3 py-4 text-center text-sm text-gray-500 italic">
            {{ t('emptyState') }}
          </li>
        </template>
      </MultiCombobox>

      <div class="flex flex-wrap gap-x-6 gap-y-3">
        <Toggle v-model="self.isLinked" :label="t('labels.link')" />
        <Toggle v-model="shouldIncludeAll" :label="t('labels.matchAll')" />
      </div>

      <ul class="flex flex-wrap gap-2 empty:hidden">
        <li v-for="[value, included] of appliedFilters.getAppliedFacet(facet).entries()" :key="value">
          <Badge
            as="button"
            type="button"
            v-tippy="{
              content: included ? t('hints.included', { value }) : t('hints.excluded', { value }),
              hideOnClick: false,
            }"
            :theme="included ? 'success' : 'danger'"
            class="inline-flex items-center gap-2 text-sm"
            @click="appliedFilters.applyStringFilter(facet, value)">
            <span>{{ value }}</span>
            <Icon v-if="included" name="lets-icons:check-fill" />
            <Icon v-else name="lets-icons:close-round-fill" />
          </Badge>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watchDebounced, watchDeep } from '@vueuse/core'
import humanizeString from 'humanize-string'
import type { FacetHit, Meilisearch } from 'meilisearch'
import Badge from '~/components/layout/Badge.vue'
import MultiCombobox from '~/components/layout/forms/MultiCombobox.vue'
import Toggle from '~/components/layout/forms/Toggle.vue'
import type { AppliedFilters } from '~/utils'

type Props = {
  client: Meilisearch
  indexUid: string
  facet: string
  appliedFilters: AppliedFilters
}

const props = defineProps<Props>()
const { t } = useI18n()
const self = reactive({
  facetHits: [] as FacetHit[],
  facetQuery: '',
  isLinked: false,
})
const pendingFacetValues = ref<string[]>([])
const shouldIncludeAll = ref(false)

const stringifyFacetHit = (facetHit: FacetHit) => facetHit.value
const facetHitKey = (facetHit: FacetHit) => facetHit.value
const keepServerResults = (_query: string, items: FacetHit[]) => items
const availableFacetHits = computed(() =>
  self.facetHits.filter(({ value }) => !props.appliedFilters.getAppliedFacet(props.facet).has(value)),
)

let latestFacetRequestId = 0
const hydrateFacetValues = async () => {
  const requestId = ++latestFacetRequestId
  const facetSearchParams = {
    facetName: props.facet,
    facetQuery: self.facetQuery,
    filter: self.isLinked ? `${props.appliedFilters.without(props.facet)}` : '',
  }
  const { facetHits } = await props.client.index(props.indexUid).searchForFacetValues(facetSearchParams)

  if (requestId === latestFacetRequestId) {
    self.facetHits = facetHits
  }
}

watch(pendingFacetValues, (values) => {
  const value = values.at(-1)
  if (undefined === value) return

  props.appliedFilters.applyStringFilter(props.facet, value)
  pendingFacetValues.value = []
  self.facetQuery = ''
})
watchDebounced(toRef(self, 'facetQuery'), hydrateFacetValues, { debounce: 150, maxWait: 500 })
watch(toRef(self, 'isLinked'), hydrateFacetValues)
watch(shouldIncludeAll, (value) => props.appliedFilters.includeAll(props.facet, value))
onMounted(async () => {
  await nextTick()
  watchDeep(toRef(props, 'appliedFilters'), hydrateFacetValues)
})
await hydrateFacetValues()
</script>

<i18n>
en:
  emptyState: No facet value found.
  placeholder: Search for facet values...
  labels:
    link: Link to other filters
    matchAll: Match all selected values
  hints:
    included: "`{value}` is included - click to exclude"
    excluded: "`{value}` is excluded - click to remove"
</i18n>
