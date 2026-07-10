<template>
  <Component
    :is="as"
    class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium"
    :class="classes">
    <slot />
  </Component>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import match from 'match-operator'

type Props = {
  as?: string | ComponentPublicInstance
  theme?: 'primary' | 'success' | 'danger' | 'neutral'
}

const props = withDefaults(defineProps<Props>(), {
  as: 'span',
  theme: 'primary',
})
const classes = computed(() =>
  match(props.theme, [
    ['primary', ['border-primary-200', 'bg-primary-50', 'text-primary-800']],
    ['success', ['border-green-200', 'bg-green-50', 'text-green-700']],
    ['danger', ['border-red-200', 'bg-red-50', 'text-red-700']],
    ['neutral', ['border-gray-200', 'bg-gray-50', 'text-gray-700']],
  ]),
)
</script>
