<template>
  <div
    class="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/70 px-6 py-10 text-center">
    <div
      class="bg-primary-50 text-primary-700 ring-primary-100 mb-4 flex size-12 items-center justify-center rounded-xl ring-1">
      <Icon :name="icon" class="size-6" />
    </div>
    <h3 class="text-base font-semibold text-gray-900">{{ title }}</h3>
    <p v-if="description" class="mt-1 max-w-lg text-sm leading-5 text-gray-500">{{ description }}</p>
    <div class="mt-5 empty:hidden"><slot name="actions" /></div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  icon: string
  title: string
  description?: string
}

defineProps<Props>()
</script>
