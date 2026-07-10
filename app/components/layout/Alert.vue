<template>
  <div class="flex gap-3 rounded-xl border px-4 py-3 text-sm" :class="themeClasses">
    <Icon :name="themeIcon" class="mt-0.5 size-5 shrink-0" />
    <div class="min-w-0 flex-1 space-y-1">
      <header class="flex items-start justify-between gap-4">
        <span class="font-semibold">{{ title ?? t('errorTitle') }}</span>
        <button
          v-if="dismissable"
          type="button"
          class="-m-1 shrink-0 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:outline-none"
          @click="emit('close')">
          <Icon name="mingcute:close-fill" class="size-4" />
        </button>
      </header>
      <div class="leading-5"><slot /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import match from 'match-operator'

type Props = {
  title?: string | null
  dismissable?: boolean
  theme?: 'default' | 'warning' | 'danger' | 'success'
}
const emit = defineEmits(['close'])
const props = withDefaults(defineProps<Props>(), {
  title: null,
  dismissable: false,
  theme: 'default',
})
const { t } = useI18n()

const themeClasses = computed(() =>
  match(props.theme, [
    ['warning', 'border-amber-200 bg-amber-50 text-amber-900'],
    ['danger', 'border-red-200 bg-red-50 text-red-900'],
    ['success', 'border-green-200 bg-green-50 text-green-900'],
    [match.default, 'border-blue-200 bg-blue-50 text-blue-900'],
  ]),
)
const themeIcon = computed(() =>
  match(props.theme, [
    ['warning', 'heroicons:exclamation-triangle'],
    ['danger', 'heroicons:x-circle'],
    ['success', 'heroicons:check-circle'],
    [match.default, 'heroicons:information-circle'],
  ]),
)
</script>

<i18n>
en:
  errorTitle: An error occured.
</i18n>
