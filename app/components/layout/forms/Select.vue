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
  const classes = ['focus:outline-none', 'focus:ring-2', 'focus:ring-primary-600']

  if (!props.noBorder) classes.push('border')
  if (!props.noPadding) classes.push('px-2', 'py-1.5')
  if (!props.noRounded) classes.push('rounded-md')

  return classes
})
const value = defineModel()
</script>
