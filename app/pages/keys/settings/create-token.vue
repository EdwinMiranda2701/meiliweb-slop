<template>
  <Layout :title="t('title')" :subtitle="t('subtitle')">
    <template #title-actions>
      <DocumentationLink href="https://www.meilisearch.com/docs/learn/security/tenant_tokens" />
    </template>
    <template #actions>
      <Button :as="RouterLink" to="/keys" theme="secondary" icon="heroicons:arrow-left">
        {{ t('actions.back') }}
      </Button>
    </template>

    <form class="mx-auto max-w-4xl space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-xs" @submit.prevent>
      <DefineAddRuleMenu v-slot="{ big }">
        <ContextualMenu v-if="availableIndexes.length > 0">
          <template #button>
            <MenuButton>
              <Button theme="primary" icon="zondicons:add-solid" :no-padding="!big" :class="big || 'px-2 py-1 text-xs'">
                {{ t('labels.addRule') }}
              </Button>
            </MenuButton>
          </template>
          <div class="block w-full cursor-default px-2 py-1.5 text-left text-xs font-light text-gray-500 italic">
            {{ t('labels.pickAnIndex') }}
          </div>
          <MenuItem v-for="indexUid of availableIndexes" :key="indexUid" v-slot="{ active }">
            <button
              type="button"
              class="block w-full px-2 py-1.5 text-left text-sm font-light"
              :class="[active ? 'bg-primary-100' : 'bg-transparent']"
              @click="addSearchRule(indexUid)">
              {{ humanizeString(indexUid) }}
            </button>
          </MenuItem>
        </ContextualMenu>
      </DefineAddRuleMenu>

      <div v-if="0 === Object.entries(searchRules).length" class="flex items-center justify-center py-10">
        <AddRuleMenu :big="true" />
      </div>

      <template v-else>
        <UniqueId as="section" v-slot="{ id }" class="space-y-1">
          <header class="flex items-center justify-between">
            <Label :for="id">{{ t('labels.searchRules') }}</Label>
            <AddRuleMenu />
          </header>
        </UniqueId>

        <UniqueId
          as="section"
          v-for="[indexUid, rules] of searchRulesMap.entries()"
          :key="indexUid"
          v-slot="{ id }"
          class="space-y-1">
          <header class="flex items-center justify-between">
            <Label :for="id" class="text-primary-800 text-sm font-light capitalize">
              {{ indexUid }}
            </Label>
            <button v-tippy="t('labels.removeRule')" type="button" @click="searchRulesMap.delete(indexUid)">
              <Icon name="wpf:full-trash" />
            </button>
          </header>
          <input
            v-focus
            v-model="rules.filter"
            :placeholder="
              placeholders.has(indexUid)
                ? t('placeholders.example', {
                    example: placeholders.get(indexUid),
                  })
                : undefined
            "
            type="text"
            class="form-input w-full" />
          <div v-if="filterStats.has(indexUid)" class="text-xs">
            <span class="text-green-600 italic">
              {{
                t('hints.matchingDocuments', {
                  nbFilteredDocuments: (filterStats.get(indexUid) as FilterStat)[0],
                  nbTotalDocuments: (filterStats.get(indexUid) as FilterStat)[1],
                })
              }}
            </span>
            <span v-if="jwt">&nbsp;-&nbsp;</span>
            <RouterLink
              v-if="jwt"
              :to="`/indexes/${indexUid}/documents?tenantToken=${jwt}`"
              class="text-primary-700 hover:text-primary-800 italic"
              target="_blank">
              {{ t('labels.preview') }}
            </RouterLink>
          </div>
          <span v-else class="text-xs text-red-600 italic">
            {{ t('hints.invalidFilterQuery') }}
          </span>
        </UniqueId>

        <UniqueId
          v-if="[...searchRulesMap.entries()].length > 0"
          as="section"
          v-slot="{ id }"
          class="space-y-1 *:block *:w-full">
          <Label required :for="id">{{ t('labels.key') }}</Label>
          <Select required v-model="keyToUse">
            <option />
            <option v-for="key of keys.results" :value="key">
              {{ key.name || key.uid }}
            </option>
          </Select>
        </UniqueId>

        <UniqueId v-if="jwt" as="section" v-slot="{ id }" class="space-y-1">
          <header class="flex items-center justify-between">
            <Label :for="id">{{ t('labels.expiresAt') }}</Label>
            <div>
              <label class="inline-flex cursor-pointer items-center gap-2">
                <span class="text-sm font-light text-gray-600 italic">
                  {{ t('labels.neverExpires') }}
                </span>
                <input type="checkbox" v-model="neverExpires" class="form-checkbox" />
              </label>
            </div>
          </header>
          <div>
            <input
              :id
              type="datetime-local"
              v-model="expiresAtInput"
              :disabled="neverExpires"
              class="form-input w-full" />
          </div>
        </UniqueId>

        <section v-if="jwt" class="rounded-md bg-green-100 p-4 shadow-md">
          <header class="flex items-center justify-between pb-2">
            <h4 class="font-medium">{{ t('labels.jwt') }}</h4>
            <ClipboardButton :source="jwt" class="size-6 shrink-0" />
          </header>
          <p class="font-mono text-sm break-words">
            {{ jwt }}
          </p>
        </section>
      </template>
    </form>
  </Layout>
</template>

<script setup lang="ts">
import DocumentationLink from '~/components/layout/DocumentationLink.vue'
import Label from '~/components/layout/forms/Label.vue'
import Select from '~/components/layout/forms/Select.vue'
import Button from '~/components/layout/forms/Button.vue'
import UniqueId from '~/components/UniqueId.vue'
import ClipboardButton from '~/components/layout/forms/ClipboardButton.vue'
import ContextualMenu from '~/components/layout/ContextualMenu.vue'
import { useMeiliClient } from '~/composables'
import { MenuButton, MenuItem } from '@headlessui/vue'
import { RouterLink } from 'vue-router'
import type { Key, TokenSearchRules } from 'meilisearch'
import type { ComputedRef } from 'vue'
import { createJwt, formatDateTimeLocal, getFilterableAttributePatterns } from '~/utils'
import { field } from 'meilisearch-filters'
import { createReusableTemplate, watchArray } from '@vueuse/core'
import humanizeString from 'humanize-string'

type Self = {
  keyToUse: Key | null
  searchRules: TokenSearchRules
  expiresAt: Date | null
  jwt: string | null
}
type NbTotalDocuments = number
type NbFilteredDocuments = number
type FilterRule = { filter: string }
type FilterStat = [NbFilteredDocuments, NbTotalDocuments]

const [DefineAddRuleMenu, AddRuleMenu] = createReusableTemplate()
const { t } = useI18n()
const meili = useMeiliClient()
const searchRulesMap = reactive(new Map<string, FilterRule>())
const placeholders = reactive(new Map<string, string | null>())
const filterStats = reactive(new Map<string, FilterStat>())
const self: Self = reactive({
  expiresAt: null as Date | null,
  keyToUse: ref(null),
  searchRules: computed(() => Object.fromEntries(searchRulesMap.entries())),
  jwt: computed(() => (self.keyToUse ? createJwt(self.searchRules, self.keyToUse, self.expiresAt ?? undefined) : null)),
})
const defaultExpiration = () => {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  return date
}
const neverExpires = computed({
  get: () => !self.expiresAt,
  set(value: boolean) {
    self.expiresAt = value ? null : defaultExpiration()
  },
}) as ComputedRef<boolean>
const expiresAtInput = computed({
  get: () => (self.expiresAt ? formatDateTimeLocal(self.expiresAt) : ''),
  set(value: string) {
    self.expiresAt = value ? new Date(value) : null
  },
})
const { keyToUse, searchRules, jwt } = toRefs(self)
const [indexes, keys] = await Promise.all([
  meili.getIndexes({ limit: 1000 }).then(({ results }) => results.map(({ uid }) => uid)),
  meili.getKeys(),
])
const availableIndexes = computed(() => indexes.filter((indexUid) => ![...searchRulesMap.keys()].includes(indexUid)))
useHead({ title: t('title') })

const addSearchRule = async (indexUid: string) => {
  searchRulesMap.set(indexUid, { filter: '' })
  await Promise.all([suggestPlaceholder(indexUid), updateFilterStats(indexUid, '')])
}
const suggestPlaceholder = async (indexUid: string) => {
  if (placeholders.has(indexUid)) {
    return
  }
  const filterableAttributes = getFilterableAttributePatterns(await meili.index(indexUid).getFilterableAttributes())
  const searchResults = await meili.index(indexUid).search(null, { facets: filterableAttributes, limit: 0 })
  let stringFilterCandidate: [string | null, string | number | null, number] = [null, null, 0]
  for (const [facetName, facetValue] of Object.entries(searchResults.facetDistribution ?? {})) {
    for (const [value, count] of Object.entries(facetValue)) {
      if (stringFilterCandidate && count > stringFilterCandidate[2]) {
        stringFilterCandidate = [facetName, value, count]
      }
    }
  }
  if (null !== stringFilterCandidate[0]) {
    placeholders.set(indexUid, `${field(stringFilterCandidate[0]).equals(stringFilterCandidate[1] as string | number)}`)
    return
  }
  for (const [facetName, stats] of Object.entries(searchResults.facetStats ?? {})) {
    const edges = [
      Math.floor(Math.random() * (stats.max - stats.min + 1) + stats.min),
      Math.floor(Math.random() * (stats.max - stats.min + 1) + stats.min),
    ]
    placeholders.set(indexUid, `${field(facetName).isBetween(...(edges.sort() as [number, number]))}`)
    return
  }
}

const updateFilterStats = async (indexUid: string, filter: string) => {
  try {
    const [{ total: nbTotalDocuments }, { total: nbFilteredDocuments }] = await Promise.all([
      meili.index(indexUid).getDocuments({ limit: 0 }),
      meili.index(indexUid).getDocuments({ filter, limit: 0 }),
    ])

    filterStats.set(indexUid, [nbFilteredDocuments, nbTotalDocuments])
  } catch (e) {
    filterStats.delete(indexUid)
  }
}

const filterRuleWatchers = new Map()
watchArray(
  () => Object.keys(self.searchRules),
  (_, __, additions, removals) => {
    if (additions.length > 0) {
      additions.forEach((indexUid) => {
        filterRuleWatchers.set(
          indexUid,
          watch(
            () => (searchRulesMap.get(indexUid) as FilterRule).filter,
            (filter) => {
              updateFilterStats(indexUid, filter)
            },
          ),
        )
      })
    }
    if (removals.length > 0) {
      removals.forEach((indexUid) => {
        const stop = filterRuleWatchers.get(indexUid)
        stop()
        filterRuleWatchers.delete(indexUid)
      })
    }
  },
)
</script>

<i18n>
en:
  title: Generate tenant token
  subtitle: Create a scoped search token from an existing API key.
  labels:
    key: Signing key
    searchRules: Search Rules
    addRule: Add rule
    removeRule: Remove rule
    jwt: "Here is your tenant token:"
    expiresAt: Expires
    neverExpires: Never
    pickAnIndex: Pick an index below...
    preview: Preview
  actions:
    back: Back to access keys
  placeholders:
    example: "Example: {example}"
  hints:
    matchingDocuments: "Matching documents: {nbFilteredDocuments}/{nbTotalDocuments}"
    invalidFilterQuery: Filter query looks invalid
</i18n>
