<template>
  <div class="flex h-full min-w-[1024px] flex-col overflow-hidden bg-gray-50 text-gray-900">
    <TopNavigation />
    <div class="relative grow">
      <div class="absolute inset-0 flex flex-col">
        <section class="static top-0 mx-auto w-full max-w-7xl px-8 pt-7 pb-5">
          <slot name="header" :title="title" :subtitle="subtitle">
            <PageHeader :title="title" :subtitle="subtitle">
              <template #title-actions>
                <slot name="title-actions" />
              </template>
              <template #actions>
                <slot name="actions" />
              </template>
            </PageHeader>
          </slot>
        </section>
        <div class="relative grow overflow-hidden">
          <div class="absolute inset-0 overflow-auto">
            <section class="mx-auto h-full w-full max-w-7xl px-8 py-5">
              <slot />
            </section>
          </div>
        </div>
      </div>
    </div>
    <section class="mx-auto w-full max-w-7xl empty:hidden">
      <slot name="footer" />
    </section>
  </div>
</template>

<script setup lang="ts">
type Props = {
  title: string
  subtitle?: string
  nowrap?: boolean
}

defineProps<Props>()
</script>
