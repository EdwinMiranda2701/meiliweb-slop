<template>
  <Layout :title="t('title')" :subtitle="t('subtitle')">
    <template #title-actions>
      <DocumentationLink href="https://www.meilisearch.com/docs/learn/security/managing_api_keys" />
    </template>
    <template #actions>
      <Button :as="RouterLink" to="/keys" theme="secondary" icon="heroicons:arrow-left">
        {{ t('actions.back') }}
      </Button>
    </template>

    <div v-if="createdKey" class="mx-auto max-w-3xl space-y-5">
      <Alert theme="success" :title="t('alerts.success.title')">
        {{ t('alerts.success.description') }}
      </Alert>
      <section class="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <div class="space-y-1.5">
          <div class="flex items-center justify-between gap-4">
            <h2 class="font-semibold text-gray-900">{{ t('alerts.success.secretKey') }}</h2>
            <ClipboardButton :source="createdKey.key" :copy-text="t('actions.copyKey')" class="size-5 shrink-0" />
          </div>
          <p class="rounded-lg bg-gray-50 p-3 font-mono text-sm break-all text-gray-700">{{ createdKey.key }}</p>
        </div>
        <div class="space-y-1.5">
          <div class="flex items-center justify-between gap-4">
            <h2 class="font-semibold text-gray-900">{{ t('alerts.success.uid') }}</h2>
            <ClipboardButton :source="createdKey.uid" :copy-text="t('actions.copyUid')" class="size-5 shrink-0" />
          </div>
          <p class="rounded-lg bg-gray-50 p-3 font-mono text-sm break-all text-gray-700">{{ createdKey.uid }}</p>
        </div>
      </section>
      <Buttons>
        <Button :as="RouterLink" to="/keys" theme="secondary">{{ t('actions.done') }}</Button>
        <Button theme="primary" icon="pajamas:doc-new" @click="createdKey = null">
          {{ t('actions.createAnother') }}
        </Button>
      </Buttons>
    </div>

    <form v-else class="mx-auto max-w-4xl space-y-6" @reset.prevent="reset()" @submit.prevent="submit()">
      <Alert v-if="error" dismissable theme="danger" @close="error = null">
        {{ error }}
      </Alert>

      <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <header>
          <h2 class="text-lg font-semibold text-gray-900">{{ t('sections.details.title') }}</h2>
          <p class="mt-1 text-sm text-gray-500">{{ t('sections.details.description') }}</p>
        </header>
        <UniqueId as="div" v-slot="{ id }" class="space-y-1">
          <Label :for="id">{{ t('labels.name') }}</Label>
          <input :id v-focus v-model="key.name" class="form-input w-full" />
        </UniqueId>
        <UniqueId as="div" v-slot="{ id }" class="space-y-1">
          <Label :for="id">{{ t('labels.description') }}</Label>
          <Textarea :id v-model="key.description" class="w-full" />
        </UniqueId>
      </section>

      <section class="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <header>
          <h2 class="text-lg font-semibold text-gray-900">{{ t('sections.permissions.title') }}</h2>
          <p class="mt-1 text-sm text-gray-500">{{ t('sections.permissions.description') }}</p>
        </header>
        <fieldset class="space-y-2">
          <legend class="font-medium">{{ t('labels.preset') }}</legend>
          <div class="grid gap-3 sm:grid-cols-3">
            <button
              v-for="preset of PERMISSION_PRESETS"
              :key="preset"
              type="button"
              :aria-pressed="activePreset === preset"
              class="rounded-lg border p-3 text-left transition-colors"
              :class="
                activePreset === preset
                  ? 'border-primary-500 bg-primary-50 ring-primary-100 ring-2'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              "
              @click="applyPreset(preset)">
              <span class="block text-sm font-semibold text-gray-900">{{ t(`presets.${preset}.title`) }}</span>
              <span class="mt-1 block text-xs leading-4 text-gray-500">{{ t(`presets.${preset}.description`) }}</span>
            </button>
          </div>
        </fieldset>

        <div class="space-y-3 border-t border-gray-100 pt-4">
          <div>
            <h3 class="font-medium">{{ t('labels.actions') }}</h3>
            <p class="mt-0.5 text-xs text-gray-500">{{ t('hints.toggleGroup') }}</p>
          </div>
          <DefineActionCheckbox v-slot="{ action }">
            <UniqueId
              v-tippy="t(`keyActions.${action}.description`)"
              as="div"
              class="flex items-center gap-1"
              v-slot="{ id }">
              <input :id :value="action" v-model="key.actions" type="checkbox" class="peer sr-only" />
              <Label
                :for="id"
                class="cursor-pointer rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2">
                <Badge :theme="key.actions.includes(action) ? 'success' : 'neutral'">
                  {{ t(`keyActions.${action}.label`) }}
                </Badge>
              </Label>
            </UniqueId>
          </DefineActionCheckbox>

          <dl class="grid grid-cols-[minmax(6rem,auto)_1fr] gap-x-4 gap-y-3 text-sm">
            <template v-for="group of ACTION_GROUPS" :key="group.label">
              <dt>
                <button
                  type="button"
                  class="text-left font-medium hover:underline"
                  @click="toggleActions(group.actions)">
                  {{ t(`labels.action.${group.label}`) }}
                </button>
              </dt>
              <dd class="flex flex-wrap items-center gap-3">
                <template v-for="action of group.actions" :key="action">
                  <ActionCheckbox :action />
                </template>
              </dd>
            </template>
          </dl>
        </div>
      </section>

      <section class="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <header>
          <h2 class="text-lg font-semibold text-gray-900">{{ t('sections.scope.title') }}</h2>
          <p class="mt-1 text-sm text-gray-500">{{ t('sections.scope.description') }}</p>
        </header>
        <UniqueId as="div" v-slot="{ id }" class="space-y-2">
          <div class="flex items-center justify-between gap-4">
            <Label :for="id">{{ t('labels.indexes') }}</Label>
            <label class="inline-flex cursor-pointer items-center gap-2">
              <input type="checkbox" v-model="key.indexes" value="*" class="form-checkbox" />
              <span class="text-sm text-gray-600">{{ t('labels.allIndexes') }}</span>
            </label>
          </div>
          <MultiCombobox
            :items="indexes"
            v-model="key.indexes"
            class="w-full"
            :input-attrs="{ id, disabled: key.indexes.includes('*') }" />
        </UniqueId>

        <UniqueId as="div" v-slot="{ id }" class="space-y-2 border-t border-gray-100 pt-4">
          <div class="flex items-center justify-between gap-4">
            <Label :for="id">{{ t('labels.expiresAt') }}</Label>
            <label class="inline-flex cursor-pointer items-center gap-2">
              <input type="checkbox" v-model="neverExpires" class="form-checkbox" />
              <span class="text-sm text-gray-600">{{ t('labels.neverExpires') }}</span>
            </label>
          </div>
          <input
            :id
            type="datetime-local"
            v-model="expiresAtInput"
            :disabled="neverExpires"
            class="form-input w-full" />
        </UniqueId>

        <Alert v-if="hasBroadAccess" theme="warning" :title="t('alerts.broadAccess.title')">
          {{ t('alerts.broadAccess.description') }}
        </Alert>
      </section>

      <footer class="flex items-center justify-between gap-4">
        <Button type="reset" theme="secondary" :disabled="!modified || loading">{{ t('actions.reset') }}</Button>
        <Buttons>
          <Button :as="RouterLink" to="/keys" theme="secondary">{{ t('actions.cancel') }}</Button>
          <Button type="submit" theme="primary" :disabled="!canSubmit || loading" :loading>
            {{ t('actions.create') }}
          </Button>
        </Buttons>
      </footer>
    </form>
  </Layout>
</template>

<script setup lang="ts">
import Buttons from '~/components/layout/forms/Buttons.vue'
import UniqueId from '~/components/UniqueId.vue'
import Label from '~/components/layout/forms/Label.vue'
import Button from '~/components/layout/forms/Button.vue'
import DocumentationLink from '~/components/layout/DocumentationLink.vue'
import Alert from '~/components/layout/Alert.vue'
import Textarea from '~/components/layout/forms/Textarea.vue'
import Badge from '~/components/layout/Badge.vue'
import MultiCombobox from '~/components/layout/forms/MultiCombobox.vue'
import ClipboardButton from '~/components/layout/forms/ClipboardButton.vue'
import { useFormSubmit, useMeiliClient } from '~/composables'
import { TOAST_FAILURE, TOAST_PLEASEWAIT, TOAST_SUCCESS, useToasts } from '~/stores/toasts'
import { formatDateTimeLocal, resettableRef } from '~/utils'
import { createReusableTemplate, watchArray } from '@vueuse/core'
import type { Key } from 'meilisearch'
import type { ComputedRef } from 'vue'
import { RouterLink } from 'vue-router'

const [DefineActionCheckbox, ActionCheckbox] = createReusableTemplate()
const { t } = useI18n()
const { loading, error, handle } = useFormSubmit()
const factory = () => ({
  name: '',
  description: '',
  actions: [] as string[],
  indexes: [] as string[],
  expiresAt: null as Date | null,
})
const { createToast } = useToasts()
const meili = useMeiliClient()
const { value: key, reset, modified } = resettableRef(factory())
const self = reactive({
  key,
  createdKey: null as Key | null,
})
const defaultExpiration = () => {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  return date
}
const neverExpires = computed({
  get: () => !self.key.expiresAt,
  set(value: boolean) {
    self.key.expiresAt = value ? null : defaultExpiration()
  },
}) as ComputedRef<boolean>
const expiresAtInput = computed({
  get: () => (self.key.expiresAt ? formatDateTimeLocal(self.key.expiresAt) : ''),
  set(value: string) {
    self.key.expiresAt = value ? new Date(value) : null
  },
})
const DOCUMENT_ACTIONS = ['documents.get', 'documents.add', 'documents.delete']
const INDEX_ACTIONS = ['indexes.get', 'indexes.create', 'indexes.update', 'indexes.delete', 'indexes.swap']
const TASK_ACTIONS = ['tasks.get', 'tasks.cancel', 'tasks.delete']
const KEY_ACTIONS = ['keys.get', 'keys.create', 'keys.update', 'keys.delete']
const SETTINGS_ACTIONS = ['settings.get', 'settings.update']
const MISC_ACTIONS = ['version', 'stats.get', 'dumps.create', 'snapshots.create']
const ACTION_GROUPS = [
  { label: 'search', actions: ['search'] },
  { label: 'documents', actions: DOCUMENT_ACTIONS },
  { label: 'indexes', actions: INDEX_ACTIONS },
  { label: 'tasks', actions: TASK_ACTIONS },
  { label: 'keys', actions: KEY_ACTIONS },
  { label: 'settings', actions: SETTINGS_ACTIONS },
  { label: 'misc', actions: MISC_ACTIONS },
]
const PERMISSION_PRESETS = ['search', 'documents', 'admin'] as const
type PermissionPreset = (typeof PERMISSION_PRESETS)[number]
const sameActions = (actions: string[]) =>
  actions.length === self.key.actions.length && actions.every((action) => self.key.actions.includes(action))
const activePreset = computed(() => {
  if (sameActions(['search'])) return 'search'
  if (sameActions(DOCUMENT_ACTIONS)) return 'documents'
  if (sameActions(['*'])) return 'admin'
  return 'custom'
})
const applyPreset = (preset: PermissionPreset) => {
  self.key.actions = [...('search' === preset ? ['search'] : 'documents' === preset ? DOCUMENT_ACTIONS : ['*'])]
  if ('admin' === preset) self.key.indexes = ['*']
}
const hasBroadAccess = computed(
  () => self.key.actions.includes('*') || (self.key.indexes.includes('*') && !self.key.expiresAt),
)
const canSubmit = computed(() => self.key.actions.length > 0 && self.key.indexes.length > 0 && modified.value)
const toggleActions = (actions: string[]) => {
  if (self.key.actions.includes('*')) self.key.actions = []
  const nbIncludedActions = self.key.actions.filter((action) => actions.includes(action)).length
  for (const action of actions) {
    const index = self.key.actions.findIndex((_action) => _action === action)
    if (index >= 0) self.key.actions.splice(index, 1)
  }
  if (nbIncludedActions === actions.length) {
    return
  }
  self.key.actions.push(...actions)
}
watchArray(
  () => self.key.indexes,
  (_, __, additions) => {
    if (additions[0] === '*') {
      self.key.indexes = ['*']
    }
  },
)

const submit = async () => {
  self.createdKey = null
  const toast = createToast({
    ...TOAST_PLEASEWAIT(t),
    immediate: false,
    title: t('toasts.success.title'),
  })
  await handle(async () => {
    toast.spawn()
    try {
      self.createdKey = await meili.createKey(self.key)
      toast.update({ ...TOAST_SUCCESS(t) })
      reset(factory())
    } catch (e) {
      toast.update({
        ...TOAST_FAILURE(t),
      })
      throw e
    }
  })
}

const { createdKey } = toRefs(self)
const indexes = (await meili.getRawIndexes({ limit: 1000 })).results.map(({ uid }) => uid)
useHead({ title: t('title') })
</script>

<i18n>
en:
  title: Create API Key
  subtitle: Choose the minimum access this key needs.
  toasts:
    success:
      title: Creating your key...
    titles:
      error: An error occurred.
    texts:
      pleaseWait: Please wait...
      done: Done.
  alerts:
      success:
        title: Your key was successfully created!
        description: Copy the key and store it somewhere secure before continuing.
        uid: UID
        secretKey: Secret key
      broadAccess:
        title: Broad access
        description: This key has full permissions or combines access to every index with no expiration. Only use this for trusted applications.
  sections:
    details:
      title: Key details
      description: Give this key a recognizable name so it is easy to identify later.
    permissions:
      title: Permissions
      description: Start with a common preset, then fine-tune individual actions if needed.
    scope:
      title: Scope and expiration
      description: Limit where the key works and how long it remains valid.
  labels:
    name: Name
    description: Description
    indexes: Indexes
    actions: Actions
    expiresAt: Expires
    allIndexes: All indexes
    neverExpires: Never
    preset: Permission preset
    action:
      search: Search
      documents: Documents
      indexes: Indexes
      tasks: Tasks
      keys: Keys
      settings: Settings
      misc: Misc.
  presets:
    search:
      title: Search only
      description: Run searches without changing indexes or documents.
    documents:
      title: Manage documents
      description: Read, add, update, and delete documents.
    admin:
      title: Full administration
      description: Unrestricted access to every action and index.
  actions:
    back: Back to access keys
    cancel: Cancel
    reset: Reset
    create: Create API key
    createAnother: Create another key
    done: Done
    copyKey: Copy key
    copyUid: Copy UID
  hints:
    toggleGroup: Select a category name to toggle the whole group.
  keyActions:
    search:
      label: SEARCH
      description: Provides access to both POST and GET search endpoints
    documents:
      get:
        label: GET
        description: Provides access to the get one document, get documents with POST, and get documents with GET endpoints.
      add:
        label: ADD
        description: Provides access to the add documents and update documents endpoints.
      delete:
        label: DELETE
        description: Provides access to the delete one document, delete all documents, batch delete, and delete by filter endpoints.
    indexes:
      get:
        label: GET
        description: Provides access to the get one index and list all indexes endpoints. Non-authorized indexes will be omitted from the response.
      create:
        label: CREATE
        description: Provides access to the create index endpoint.
      update:
        label: UPDATE
        description: Provides access to the update index endpoint.
      delete:
        label: DELETE
        description: Provides access to the delete index endpoint.
      swap:
        label: SWAP
        description: Provides access to the swap indexes endpoint. Non-authorized indexes will not be swapped.
    tasks:
      get:
        label: GET
        description: Provides access to the get one task and get tasks endpoints. Tasks from non-authorized indexes will be omitted from the response.
      cancel:
        label: CANCEL
        description: Provides access to the cancel tasks endpoint. Tasks from non-authorized indexes will not be canceled.
      delete:
        label: DELETE
        description: Provides access to the delete tasks endpoint. Tasks from non-authorized indexes will not be deleted.
    settings:
      get:
        label: GET
        description: Provides access to the get settings endpoint and equivalents for all subroutes.
      update:
        label: UPDATE
        description: Provides access to the update settings and reset settings endpoints and equivalents for all subroutes.
    keys:
      get:
        label: GET
        description: Provides access to the get all keys endpoint.
      create:
        label: CREATE
        description: Provides access to the create key endpoint.
      update:
        label: UPDATE
        description: Provides access to the update key endpoint.
      delete:
        label: DELETE
        description: Provides access to the delete key endpoint.
    version:
      label: VERSION
      description: Provides access to the get Meilisearch version endpoint.
    stats:
      get:
        label: STATS
        description: Provides access to the get stats of an index endpoint and the get stats of all indexes endpoint. For the latter, non-authorized indexes are omitted from the response.
    dumps:
      create:
        label: CREATE DUMP
        description: Provides access to the create dump endpoint. Not restricted by indexes.
    snapshots:
      create:
        label: CREATE SNAPSHOT
        description: Provides access to the create dump endpoint. Not restricted by indexes.
</i18n>
