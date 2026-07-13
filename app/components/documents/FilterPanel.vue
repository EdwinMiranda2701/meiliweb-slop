<template>
  <div class="divide-y divide-gray-200">
    <section class="space-y-2 px-4 pb-6 sm:px-6">
      <h3 class="text-md font-medium">{{ t('titles.sort') }}</h3>
      <UniqueId v-if="sortableAttributes.length > 0" v-slot="{ id }">
        <div class="flex items-center justify-between gap-1 text-sm">
          <Label :for="id" class="text-gray-400">
            {{ t('labels.sortBy') }}
          </Label>
          <Select :id="id" v-model="appliedSort">
            <option :value="[]">Default</option>
            <template v-for="attribute of sortableAttributes">
              <option :value="[`${attribute}:asc`]">{{ humanizeString(attribute) }} ⬆</option>
              <option :value="[`${attribute}:desc`]">{{ humanizeString(attribute) }} ⬇</option>
            </template>
          </Select>
        </div>
      </UniqueId>
      <i18n-t v-else keypath="emptyStates.sort.text" tag="p" class="text-sm font-light text-gray-600 italic">
        <template v-slot:link>
          <RouterLink :to="`/indexes/${indexUid}/settings/sortable-attributes`" class="text-primary-600">
            {{ t('emptyStates.sort.link') }}
          </RouterLink>
        </template>
      </i18n-t>
    </section>

    <section class="space-y-2 px-4 pt-6 pb-6 sm:px-6">
      <h3 class="text-md font-medium">{{ t('titles.facets') }}</h3>
      <UniqueId v-if="filterableAttributes.length > 0" v-slot="{ id }">
        <div class="space-y-1 text-sm">
          <MultiCombobox
            v-model="facets"
            :items="filterableAttributes.filter((a) => '_geo' !== a)"
            :stringify="humanizeString"
            class="block w-full"
            :input-attrs="{
              class: 'text-xs',
              placeholder: (facets?.length ?? 0) > 0 ? '' : t('placeholders.enableFacets'),
            }" />
        </div>
      </UniqueId>
      <i18n-t v-else keypath="emptyStates.facets.text" tag="p" class="text-sm font-light text-gray-600 italic">
        <template v-slot:link>
          <RouterLink :to="`/indexes/${indexUid}/settings/filterable-attributes`" class="text-primary-600">
            {{ t('emptyStates.facets.link') }}
          </RouterLink>
        </template>
      </i18n-t>
    </section>

    <section v-if="(facets as NonNullable<string[]>).length > 0" class="space-y-4 pt-6 pb-6">
      <h3 class="text-md px-4 font-medium sm:px-6">
        {{ t('titles.filters') }}
      </h3>
      <template v-for="facet of facets" :key="facet">
        <StringFacet
          v-if="FACET_TYPE_STRING === facetsTypeMap.get(facet)"
          :client
          :index-uid="indexUid"
          :facet
          :applied-filters="appliedFilters" />
        <RangeFacet
          v-else-if="FACET_TYPE_RANGE === facetsTypeMap.get(facet) && facetStats[facet]"
          :index-uid="indexUid"
          :facet
          :min="facetStats[facet].min"
          :max="facetStats[facet].max"
          :applied-filters="appliedFilters" />
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useMeiliClient } from '~/composables'
import MultiCombobox from '~/components/layout/forms/MultiCombobox.vue'
import StringFacet from '~/components/documents/StringFacet.vue'
import type { AppliedFilters } from '~/utils/applied-filters'
import { type FacetDistribution, type FacetStats, Meilisearch } from 'meilisearch'
import RangeFacet from '~/components/documents/RangeFacet.vue'
import Select from '~/components/layout/forms/Select.vue'
import Label from '~/components/layout/forms/Label.vue'
import humanizeString from 'humanize-string'

type Props = {
  client: Meilisearch
  indexUid: string
  sortableAttributes: string[]
  filterableAttributes: string[]
}
const props = defineProps<Props>()
const { t } = useI18n()
const meili = useMeiliClient()
const appliedSort = defineModel<string[]>('appliedSort')
const appliedFilters = defineModel<AppliedFilters>('appliedFilters') as unknown as AppliedFilters
const facets = defineModel<string[]>('facets')
const FACET_TYPE_STRING = Symbol()
const FACET_TYPE_RANGE = Symbol()
const FACET_TYPE_GEO = Symbol()
const self = reactive({
  facets,
  appliedStringFilters: appliedFilters,
  facetsTypeMap: new Map(),
  facetStats: {} as FacetStats,
})

const isProbablyRangeFacet = (
  attribute: string,
  numericFacets: string[],
  stringFacets: string[],
  facetDistribution: FacetDistribution,
  facetStats: FacetStats,
) => {
  if (!numericFacets.includes(attribute)) return false

  const stats = facetStats[attribute]
  // Degenerate ranges (booleans with a single value, constants) are better as chips.
  if (!stats || stats.min === stats.max) return false

  const keys = Object.keys(facetDistribution[attribute] ?? {})
  // Low-cardinality numerics (0/1 flags, small enums) work better as discrete chips.
  if (keys.length > 0 && keys.length <= 10) return false

  return !stringFacets.includes(attribute) || keys.every((key) => !isNaN(Number(key)))
}

const hydrateFacetsTypes = async (facets: string[]) => {
  if (!facets?.length) {
    self.facetsTypeMap.clear()
    self.facetStats = {}
    return
  }

  const search = await meili.index(props.indexUid).search(
    null,
    reactive({
      limit: 0,
      facets,
    }),
  )
  const facetDistribution = (search.facetDistribution ?? {}) as FacetDistribution
  const facetStats = (search.facetStats ?? {}) as FacetStats
  const stringFacets = Object.keys(facetDistribution)
  const numericFacets = Object.keys(facetStats)

  self.facetsTypeMap.clear()
  for (const attribute of facets) {
    if ('_geo' === attribute) {
      self.facetsTypeMap.set(attribute, FACET_TYPE_GEO)
    } else if (isProbablyRangeFacet(attribute, numericFacets, stringFacets, facetDistribution, facetStats)) {
      self.facetsTypeMap.set(attribute, FACET_TYPE_RANGE)
    } else if (stringFacets.includes(attribute)) {
      self.facetsTypeMap.set(attribute, FACET_TYPE_STRING)
    }
  }

  self.facetStats = facetStats
}

watch(facets as unknown as string[], hydrateFacetsTypes)
const { facetsTypeMap, facetStats } = toRefs(self)
await hydrateFacetsTypes(self.facets as unknown as string[])
</script>

<i18n>
en:
  titles:
    sort: Sort documents
    facets: Facets
    filters: Filters
  labels:
    sortBy: "Sort by:"
  placeholders:
    enableFacets: "Enable facets..."
  emptyStates:
    sort:
      text: Sorting is not enabled on this index.
            Go to {link} to configure it.
      link: Settings > Sortable attributes
    facets:
      text: Filtering is not enabled on this index.
            Go to {link} to configure it.
      link: Settings > Filterable attributes
</i18n>
