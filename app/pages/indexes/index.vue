<template>
  <Layout :title="t('title')">
    <template #actions>
      <Button v-if="indexes.length > 0" :as="RouterLink" to="/indexes/create" theme="primary" icon="pajamas:doc-new">
        {{ t('actions.create') }}
      </Button>
    </template>
    <template v-if="indexes.length > 0">
      <Table :items="indexes" :keys="['uid', 'numberOfDocuments', 'primaryKey', 'createdAt', 'updatedAt']">
        <template #columns>
          <th scope="col">{{ t('columns.index') }}</th>
          <th scope="col">
            {{ t('columns.primaryKey') }}
          </th>
          <th scope="col">{{ t('columns.createdAt') }}</th>
          <th scope="col">{{ t('columns.updatedAt') }}</th>
          <th scope="col">
            <div class="text-right">
              {{ t('columns.numberOfDocuments') }}
            </div>
          </th>
          <th />
        </template>
        <template #default="{ item }">
          <td class="font-medium">
            <span class="flex min-w-0 items-start gap-2">
              <RouterLink
                :to="`/indexes/${item.uid}/documents`"
                class="hover:text-primary-700 font-semibold break-all hover:underline">
                {{ item.uid }}
              </RouterLink>
              <Badge v-if="item.isIndexing" class="text-xs uppercase">
                {{ t('labels.isIndexing') }}
              </Badge>
            </span>
          </td>
          <td>
            <Badge theme="neutral">{{ item.primaryKey }}</Badge>
          </td>
          <td>{{ formatDate(item.createdAt) }}</td>
          <td>{{ formatDate(item.updatedAt) }}</td>
          <td class="text-right">
            {{ item.numberOfDocuments }}
          </td>
          <td class="text-right">
            <ContextualMenu>
              <MenuItem v-slot="{ active }">
                <RouterLink
                  :to="`/indexes/${item.uid}/settings`"
                  class="flex w-full items-center justify-start gap-2 p-2"
                  :class="{ 'bg-gray-50': active }">
                  <Icon name="heroicons-outline:cog" class="size-5 opacity-70" />
                  <span>{{ t('actions.settings') }}</span>
                </RouterLink>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <button
                  type="button"
                  class="flex w-full items-center justify-start gap-2 p-2"
                  :class="{ 'bg-gray-50': active }"
                  @click="renameIndex(item.uid)">
                  <Icon name="heroicons:pencil" class="size-5 opacity-70" />
                  <span>{{ t('actions.rename') }}</span>
                </button>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <button
                  type="button"
                  class="flex w-full items-center justify-start gap-2 p-2"
                  :class="{ 'bg-gray-50': active }"
                  @click="duplicateIndex(item.uid)">
                  <Icon name="heroicons:document-duplicate" class="size-5 opacity-70" />
                  <span>{{ t('actions.duplicate') }}</span>
                </button>
              </MenuItem>
            </ContextualMenu>
          </td>
        </template>
      </Table>

      <div class="mt-4 flex items-center justify-between">
        <PageSize v-model="itemsPerPage" />
        <Pagination
          :current-page="currentPage"
          :last-page="lastPage"
          :previous-page="previousPage"
          :next-page="nextPage"
          @update:page="handlePageChange" />
      </div>

      <ServerStats class="mt-6" />
    </template>

    <EmptyState v-else icon="heroicons:circle-stack" :title="t('emptyState')">
      <template #actions>
        <Button :as="RouterLink" :to="`/indexes/create`" theme="primary" icon="pajamas:doc-new">
          {{ t('actions.createExpanded') }}
        </Button>
      </template>
    </EmptyState>
  </Layout>
</template>

<script setup lang="ts">
import { tryOrThrow } from '~/utils'
import { useDateFormatter, useIndexOperations, useMeiliClient, usePagination } from '~/composables'
import { RouterLink } from 'vue-router'
import ServerStats from '~/components/settings/ServerStats.vue'
import Table from '~/components/layout/tables/Table.vue'
import Badge from '~/components/layout/Badge.vue'
import Button from '~/components/layout/forms/Button.vue'
import ContextualMenu from '~/components/layout/ContextualMenu.vue'
import EmptyState from '~/components/layout/EmptyState.vue'
import { MenuItem } from '@headlessui/vue'
import { Index } from 'meilisearch'
import { promiseTimeout, whenever } from '@vueuse/core'
import Pagination from '~/components/layout/pagination/Pagination.vue'
import PageSize from '~/components/layout/pagination/PageSize.vue'

const { t } = useI18n()
useHead({
  title: t('title'),
})

const meili = useMeiliClient()
const { formatDate } = useDateFormatter()
const itemsPerPage = ref(20)
const { offset, totalItems, currentPage, previousPage, nextPage, lastPage } = usePagination(itemsPerPage)
const self = reactive({
  indexes: [] as Index[],
  totalItems,
  currentPage,
  previousPage,
  nextPage,
  lastPage,
  itemsPerPage,
  offset,
})

const fetchIndexes = async (offset = self.offset, limit = self.itemsPerPage) =>
  tryOrThrow(async () => {
    const indexes = await meili.getIndexes({ offset, limit })
    self.totalItems = indexes.total
    return Promise.all(indexes.results.map((index) => meili.getIndex(index.uid)))
  })

whenever(
  toRef(self, 'indexes'),
  async (indexes) => {
    for (const index of indexes) {
      let indexInfo = await meili.getIndex(index.uid)
      Object.assign(index, await indexInfo.getStats())
    }
  },
  { immediate: true },
)

const { duplicateIndex: doDuplicateIndex, renameIndex: doRenameIndex } = useIndexOperations()
const duplicateIndex = async (indexUid: string) => {
  const newIndexUid = await doDuplicateIndex(indexUid)
  await promiseTimeout(1000)
  await navigateTo(`/indexes/${newIndexUid}/documents`)
}

const renameIndex = async (indexUid: string) => {
  const newIndexUid = await doRenameIndex(indexUid)
  await promiseTimeout(1000)
  await navigateTo(`/indexes/${newIndexUid}/documents`)
}
const { indexes } = toRefs(self)
watch(offset, async (offset) => {
  self.indexes = []
  self.indexes = await fetchIndexes(offset)
})
watch(itemsPerPage, async (itemsPerPage) => {
  self.indexes = []
  self.indexes = await fetchIndexes(0, itemsPerPage)
})
const handlePageChange = (page: number) => (self.offset = (page - 1) * self.itemsPerPage)
self.indexes = await fetchIndexes()
</script>

<i18n>
en:
  title: Indexes
  emptyState: Your Meilisearch instance has no index yet.
  columns:
    index: Index
    numberOfDocuments: Nb. docs
    primaryKey: Primary Key
    createdAt: Created At
    updatedAt: Updated At
  labels:
    isIndexing: Indexing
  actions:
    create: Create
    createExpanded: Create an index
    settings: Settings
    duplicate: Duplicate
    rename: Rename
</i18n>
