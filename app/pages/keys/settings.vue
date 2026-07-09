<template>
  <Layout :title="t('title')" :subtitle="t('subtitle')">
    <template #title-actions>
      <RouterLink to="/keys" v-tippy="t('actions.listKeys')">
        <Icon name="gg:list" />
      </RouterLink>
    </template>
    <div class="grid h-48 grid-cols-12 gap-4">
      <menu class="col-span-3 space-y-3">
        <li
          :class="[
            'keys-settings-create' === $route.name ? 'bg-primary-600 text-white' : 'bg-gray-50 hover:bg-gray-100',
            'block w-full rounded-lg shadow-md',
          ]">
          <RouterLink to="/keys/settings/create" class="block size-full px-2 py-3 text-sm">
            {{ t('menu.createKey') }}
          </RouterLink>
        </li>
        <li
          :class="[
            'keys-settings-create-token' === $route.name ? 'bg-primary-600 text-white' : 'bg-gray-50 hover:bg-gray-100',
            'block w-full rounded-lg shadow-md',
          ]">
          <RouterLink to="/keys/settings/create-token" class="block size-full px-2 py-3 text-sm">
            {{ t('menu.createTenantToken') }}
          </RouterLink>
        </li>
      </menu>
      <div class="col-span-9">
        <RouterView />
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const { t } = useI18n()
</script>

<i18n>
en:
  title: Access Keys
  subtitle: Configuration
  menu:
    createKey: Create key
    createTenantToken: Create tenant token
  actions:
    listKeys: Go to keys list
</i18n>
