<template>
  <select v-model="value" :class="classes">
    <slot />
  </select>
</template>
<script setup lang="ts">
type Props = {
  noBorder?: boolean
  noPadding?: boolean
  noRounded?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  noBorder: false,
  noPadding: false,
  noRounded: false,
})
const classes = computed(() => {
  const classes = [
    'bg-white',
    'text-sm',
    'transition-colors',
    'focus:outline-none',
    'focus:border-primary-400',
    'focus:ring-2',
    'focus:ring-primary-500/20',
    'disabled:cursor-not-allowed',
    'disabled:border-gray-200',
    'disabled:bg-gray-100',
    'disabled:text-gray-500',
  ]

  if (!props.noBorder) classes.push('border', 'border-gray-300', 'shadow-xs')
  if (!props.noPadding) classes.push('px-2', 'py-1.5')
  if (!props.noRounded) classes.push('rounded-lg')

  return classes
})
const value = defineModel()
</script>
