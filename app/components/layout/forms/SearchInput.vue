<template>
  <div class="relative">
    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
      <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
    </div>
    <input
      v-model="value"
      name="search"
      autocomplete="off"
      class="form-input block h-10 w-full pr-3 pl-10 text-sm"
      :placeholder="t('placeholder')"
      type="search"
      v-bind="inputAttrs" />
  </div>
</template>

<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/20/solid'

type Props = {
  inputAttrs?: any
}
defineProps<Props>()
const value = defineModel()
const { t } = useI18n()
</script>

<i18n>
en:
  placeholder: Search...
</i18n>
