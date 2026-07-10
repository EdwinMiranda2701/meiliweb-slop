<template>
  <div class="border-primary-400 border-l-2 pl-4">
    <header class="flex items-center justify-between gap-6">
      <div class="min-w-0 flex-1">
        <div class="flex min-w-0 items-center gap-2.5">
          <h1 class="min-w-0 text-3xl font-bold tracking-tight break-words text-gray-950 capitalize">{{ title }}</h1>
          <span class="shrink-0">
            <slot name="title-actions" />
          </span>
        </div>
        <h2 v-if="subtitle" class="mt-1 text-sm leading-5 text-gray-600">
          {{ subtitle }}
        </h2>
      </div>

      <div class="flex shrink-0 items-center justify-end gap-3 text-sm">
        <slot name="actions" />
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
type Props = {
  title: string
  subtitle?: string
}

defineProps<Props>()
</script>
