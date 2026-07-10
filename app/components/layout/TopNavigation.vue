<template>
  <header class="relative z-30 shrink-0 border-b border-gray-200 bg-white shadow-xs">
    <div class="mx-auto max-w-7xl px-8">
      <div class="flex h-16 items-center justify-between gap-8">
        <div class="flex min-w-0 items-center gap-3">
          <RouterLink to="/" class="shrink-0" aria-label="Meiliweb home">
            <img class="size-12" :src="logoUrl" alt="Meiliweb" />
          </RouterLink>
          <div class="min-w-0">
            <RouterLink to="/" class="block text-base leading-5 font-semibold text-gray-950">Meiliweb</RouterLink>
            <div class="flex min-w-0 items-center gap-1.5">
              <RouterLink
                to="/"
                class="block max-w-80 truncate text-xs text-gray-500 hover:text-gray-700"
                :title="`${credentials!.baseUri} · Meilisearch ${version?.pkgVersion ?? ''}`">
                {{ credentials!.name || credentials!.baseUri }} · Meilisearch {{ version?.pkgVersion }}
              </RouterLink>
              <Menu as="div" class="relative shrink-0">
                <MenuButton
                  v-tippy="t('actions.switchInstance')"
                  class="focus-visible:ring-primary-500 inline-flex size-6 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus-visible:ring-2 focus-visible:outline-none">
                  <Icon name="heroicons:chevron-down" class="size-3.5" />
                </MenuButton>
                <transition
                  enter-active-class="transition duration-100 ease-out"
                  enter-from-class="scale-95 opacity-0"
                  enter-to-class="scale-100 opacity-100"
                  leave-active-class="transition duration-75 ease-in"
                  leave-from-class="scale-100 opacity-100"
                  leave-to-class="scale-95 opacity-0">
                  <MenuItems
                    class="absolute left-0 z-50 mt-2 max-h-[calc(100vh-5rem)] w-72 origin-top-left divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl focus:outline-none">
                    <div v-if="otherInstances.length" class="space-y-0.5 pb-1">
                      <div v-for="instance in otherInstances" :key="instance.id" class="flex items-stretch gap-0.5">
                        <MenuItem v-slot="{ active }">
                          <button
                            type="button"
                            :class="active ? 'bg-primary-50' : ''"
                            class="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-gray-700"
                            @click="switchInstance(instance.id!)">
                            <Icon name="heroicons:server" class="size-5 shrink-0 text-gray-400" />
                            <span class="min-w-0 flex-1">
                              <span class="block truncate font-medium">{{ instance.name || instance.baseUri }}</span>
                              <span v-if="instance.name" class="block truncate text-xs text-gray-500">
                                {{ instance.baseUri }}
                              </span>
                            </span>
                          </button>
                        </MenuItem>
                        <MenuItem v-slot="{ active }">
                          <button
                            type="button"
                            :aria-label="t('actions.removeInstance', { instance: instance.name || instance.baseUri })"
                            :class="active ? 'bg-red-50 text-red-600' : 'text-gray-400'"
                            class="rounded-lg px-2 transition-colors hover:bg-red-50 hover:text-red-600"
                            @click="removeInstance(instance.id!)">
                            <Icon name="heroicons:trash" class="size-4" />
                          </button>
                        </MenuItem>
                      </div>
                    </div>
                    <MenuItem v-slot="{ active }">
                      <RouterLink
                        to="/login"
                        :class="active ? 'bg-primary-50' : ''"
                        class="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-gray-700">
                        <Icon name="heroicons:plus-circle" class="size-5 text-gray-400" />
                        {{ t('actions.connectToInstance') }}
                      </RouterLink>
                    </MenuItem>
                  </MenuItems>
                </transition>
              </Menu>
            </div>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-1">
          <GithubButton />
          <LogoutButton />
        </div>
      </div>

      <nav class="flex h-11 items-center gap-1" aria-label="Global">
        <RouterLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          :class="[
            item.current
              ? 'bg-primary-50 text-primary-800 ring-primary-100 ring-1'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            'inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
          ]"
          :aria-current="item.current ? 'page' : undefined">
          {{ item.name }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import GithubButton from '~/components/layout/GithubButton.vue'
import LogoutButton from '~/components/layout/LogoutButton.vue'
import { useCredentials, useVersion } from '~/stores'
import logoUrl from '~/assets/images/logo.svg'

const route = useRoute()
const navigation = reactive([
  { name: 'Indexes', href: '/indexes', current: computed(() => String(route.name ?? '').startsWith('indexes')) },
  { name: 'Access Keys', href: '/keys', current: computed(() => String(route.name ?? '').startsWith('keys')) },
  { name: 'Tasks', href: '/tasks', current: computed(() => String(route.name ?? '').startsWith('tasks')) },
  { name: 'Network', href: '/network', current: computed(() => String(route.name ?? '').startsWith('network')) },
  { name: 'Dumps', href: '/dumps', current: computed(() => String(route.name ?? '').startsWith('dumps')) },
  { name: 'Snapshots', href: '/snapshots', current: computed(() => String(route.name ?? '').startsWith('snapshots')) },
  { name: 'Webhooks', href: '/webhooks', current: computed(() => String(route.name ?? '').startsWith('webhooks')) },
  {
    name: 'Experimental',
    href: '/experimental-features',
    current: computed(() => String(route.name ?? '').startsWith('experimental-features')),
  },
])

const { credentials, records, switchInstance, removeInstance: doRemoveInstance } = safeToRefs(useCredentials())
const { confirm } = useConfirmationDialog()
const { version } = useVersion()
const savedInstances = computed(() => Array.from(records.value.values()))
const otherInstances = computed(() => savedInstances.value.filter(({ id }) => id !== credentials.value?.id))
const { t } = useI18n()

const removeInstance = async (id: string) => {
  if (await confirm({ text: t('confirm.removeInstance') })) doRemoveInstance(id)
}
</script>

<i18n>
en:
  actions:
    connectToInstance: Connect to another instance
    removeInstance: Remove {instance}
    switchInstance: Switch instance
  confirm:
    removeInstance: Are you sure you want to log out from this instance?
</i18n>
