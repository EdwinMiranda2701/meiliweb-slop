<template>
  <Layout :title="t('title')" :subtitle="t('subtitle')">
    <template #actions>
      <Button :as="RouterLink" to="/keys/tenant-token" theme="secondary" icon="heroicons:key">
        {{ t('actions.generateTenantToken') }}
      </Button>
      <Button :as="RouterLink" to="/keys/create" theme="primary" icon="pajamas:doc-new">
        {{ t('actions.create') }}
      </Button>
    </template>
    <template v-if="keys.length > 0">
      <Table :items="keys" auto-layout>
        <template #columns>
          <th scope="col">{{ t('columns.key') }}</th>
          <th scope="col" class="w-40">{{ t('columns.scope') }}</th>
          <th scope="col" class="w-60">{{ t('columns.permissions') }}</th>
          <th scope="col" class="w-44">{{ t('columns.expiresAt') }}</th>
          <th class="w-14">
            <span class="sr-only">{{ t('columns.actions') }}</span>
          </th>
        </template>
        <template #default="{ item }">
          <td>
            <div class="space-y-1">
              <div class="font-semibold text-gray-900">{{ item.name || t('placeholders.unnamed') }}</div>
              <p v-if="item.description" class="text-sm text-gray-600">
                {{ item.description }}
              </p>
              <div class="flex items-center gap-1.5 font-mono text-xs text-gray-500">
                <span class="break-all">{{ item.uid }}</span>
                <ClipboardButton :source="item.uid" :copy-text="t('hints.copyUid')" class="size-3.5 shrink-0" />
              </div>
              <div class="text-xs text-gray-500">
                {{ t('labels.created', { date: formatDate(item.createdAt) }) }}
              </div>
            </div>
          </td>
          <td>
            <Badge theme="neutral">{{ scopeLabel(item) }}</Badge>
            <details v-if="!item.indexes.includes('*')" class="mt-2 text-xs">
              <summary class="cursor-pointer text-gray-500 hover:text-gray-700">
                {{ t('actions.viewIndexes') }}
              </summary>
              <ul class="mt-1 space-y-0.5 font-mono text-gray-600">
                <li v-for="index of item.indexes" :key="index" class="break-all">{{ index }}</li>
              </ul>
            </details>
          </td>
          <td>
            <div class="flex max-w-xs flex-wrap gap-1.5">
              <Badge v-for="permission of visiblePermissions(item)" :key="permission" theme="neutral">
                {{ permission }}
              </Badge>
              <Badge v-if="hiddenPermissionCount(item) > 0" theme="neutral">
                {{ t('labels.more', { count: hiddenPermissionCount(item) }) }}
              </Badge>
            </div>
            <details v-if="!item.actions.includes('*')" class="mt-2 text-xs">
              <summary class="cursor-pointer text-gray-500 hover:text-gray-700">
                {{ t('actions.viewActions') }}
              </summary>
              <ul class="mt-1 space-y-0.5 font-mono text-gray-600">
                <li v-for="action of item.actions" :key="action" class="break-all">{{ action }}</li>
              </ul>
            </details>
          </td>
          <td class="whitespace-nowrap">
            <Badge v-if="expirationState(item).status === 'expired'" theme="danger">
              {{ t('expiration.expired') }}
            </Badge>
            <Badge v-else-if="expirationState(item).status === 'soon'">
              {{ t('expiration.soon') }}
            </Badge>
            <span v-else-if="expirationState(item).status === 'never'" class="text-gray-500">
              {{ t('expiration.never') }}
            </span>
            <span v-else>{{ formatDate(item.expiresAt) }}</span>
          </td>
          <td class="text-right">
            <ContextualMenu>
              <MenuItem v-slot="{ active }">
                <button
                  type="button"
                  class="flex w-full items-center gap-2 p-2 text-left"
                  :class="{ 'bg-gray-50': active }"
                  @click="copyKey(item)">
                  <Icon name="mingcute:copy-line" class="size-5 opacity-70" />
                  <span>{{ t('actions.copyKey') }}</span>
                </button>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <button
                  type="button"
                  class="flex w-full items-center gap-2 p-2 text-left text-red-700"
                  :class="{ 'bg-red-50': active }"
                  @click="deleteKey(item)">
                  <Icon name="wpf:full-trash" class="size-5 opacity-70" />
                  <span>{{ t('actions.revoke') }}</span>
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
    </template>

    <EmptyState v-else icon="heroicons:key" :title="t('emptyState.title')" :description="t('emptyState.description')">
      <template #actions>
        <Button :as="RouterLink" to="/keys/create" theme="primary" icon="pajamas:doc-new">
          {{ t('actions.create') }}
        </Button>
      </template>
    </EmptyState>
  </Layout>
</template>

<script setup lang="ts">
import { tryOrThrow } from '~/utils'
import { TOAST_FAILURE, TOAST_PLEASEWAIT, TOAST_SUCCESS, useConfirmationDialog, useToasts } from '~/stores'
import { useClipboard } from '@vueuse/core'
import type { Key } from 'meilisearch'
import { RouterLink } from 'vue-router'
import Table from '~/components/layout/tables/Table.vue'
import ClipboardButton from '~/components/layout/forms/ClipboardButton.vue'
import Button from '~/components/layout/forms/Button.vue'
import Badge from '~/components/layout/Badge.vue'
import ContextualMenu from '~/components/layout/ContextualMenu.vue'
import EmptyState from '~/components/layout/EmptyState.vue'
import Pagination from '~/components/layout/pagination/Pagination.vue'
import PageSize from '~/components/layout/pagination/PageSize.vue'
import { MenuItem } from '@headlessui/vue'

const client = useMeiliClient()
const { formatDate } = useDateFormatter()
const { t } = useI18n()
const { confirm } = useConfirmationDialog()
const { createToast } = useToasts()
const { copy } = useClipboard()
useHead({
  title: t('title'),
})

const itemsPerPage = ref(20)
const { offset, totalItems, currentPage, previousPage, nextPage, lastPage } = usePagination(itemsPerPage)
const keys = ref<Key[]>([])

const fetchKeys = async (currentOffset = offset.value, limit = itemsPerPage.value) =>
  tryOrThrow(async () => {
    const response = await client.getKeys({ offset: currentOffset, limit })
    totalItems.value = response.total
    keys.value = response.results
  })

const permissionLabels: Record<string, string> = {
  search: t('permissions.search'),
  documents: t('permissions.documents'),
  indexes: t('permissions.indexes'),
  tasks: t('permissions.tasks'),
  keys: t('permissions.keys'),
  settings: t('permissions.settings'),
  version: t('permissions.system'),
  stats: t('permissions.system'),
  dumps: t('permissions.system'),
  snapshots: t('permissions.system'),
}
const permissions = (key: Key) => {
  if (key.actions.includes('*')) return [t('permissions.all')]
  return [...new Set(key.actions.map((action) => permissionLabels[action.split('.')[0]] ?? action))]
}
const visiblePermissions = (key: Key) => permissions(key).slice(0, 2)
const hiddenPermissionCount = (key: Key) => Math.max(0, permissions(key).length - 2)
const scopeLabel = (key: Key) =>
  key.indexes.includes('*') ? t('scope.all') : t('scope.count', { count: key.indexes.length })
const expirationState = (key: Key) => {
  if (!key.expiresAt) return { status: 'never' as const }
  const milliseconds = new Date(key.expiresAt).getTime() - Date.now()
  if (milliseconds <= 0) return { status: 'expired' as const }
  if (milliseconds <= 7 * 24 * 60 * 60 * 1000) return { status: 'soon' as const }
  return { status: 'active' as const }
}

const copyKey = async (key: Key) => {
  await copy(key.key)
  createToast({ ...TOAST_SUCCESS(t), title: t('toasts.copied') })
}
const deleteKey = async (key: Key) => {
  if (!(await confirm({ text: t('confirmations.revoke', { name: key.name || key.uid }) }))) return
  const toast = createToast({ ...TOAST_PLEASEWAIT(t), title: t('toasts.revoking') })
  try {
    await client.deleteKey(key.uid)
  } catch (error) {
    toast.update({ ...TOAST_FAILURE(t) })
    return
  }

  keys.value = keys.value.filter(({ uid }) => uid !== key.uid)
  totalItems.value = Math.max(0, totalItems.value - 1)
  toast.update({ ...TOAST_SUCCESS(t) })

  if (0 === keys.value.length && offset.value > 0) {
    offset.value = Math.max(0, offset.value - itemsPerPage.value)
    return
  }

  try {
    await fetchKeys()
  } catch (error) {
    createToast({
      ...TOAST_FAILURE(t),
      title: t('toasts.refreshFailed'),
      text: t('toasts.refreshFailedText'),
    })
  }
}

watch([offset, itemsPerPage], ([currentOffset, limit]) => fetchKeys(currentOffset, limit))
const handlePageChange = (page: number) => (offset.value = (page - 1) * itemsPerPage.value)
await fetchKeys()
</script>

<i18n>
en:
  title: Access Keys
  subtitle: Control how applications and team members access this instance.
  columns:
    key: Key
    scope: Scope
    permissions: Permissions
    actions: Actions
    expiresAt: Expires
  labels:
    created: Created {date}
    more: +{count} more
  placeholders:
    unnamed: Unnamed key
  actions:
    create: Create API key
    generateTenantToken: Generate tenant token
    copyKey: Copy key
    revoke: Revoke key
    viewIndexes: View indexes
    viewActions: View exact actions
  hints:
    copyUid: Copy UID
  scope:
    all: All indexes
    count: '{count} index | {count} indexes'
  permissions:
    all: Full access
    search: Search
    documents: Documents
    indexes: Indexes
    tasks: Tasks
    keys: Keys
    settings: Settings
    system: System
  expiration:
    never: Never
    expired: Expired
    soon: Expiring soon
  emptyState:
    title: No API keys found
    description: Create a key to give an application or team member scoped access to this instance.
  confirmations:
    revoke: Revoke “{name}”? Applications using this key will immediately lose access.
  toasts:
    copied: Key copied
    revoking: Revoking key...
    refreshFailed: Key revoked, but refresh failed
    refreshFailedText: Reload the page to refresh the key list.
    titles:
      error: An error occurred.
    texts:
      pleaseWait: Please wait...
      done: Done.
</i18n>
