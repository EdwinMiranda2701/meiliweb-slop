<template>
  <textarea :disabled :class="classes" v-if="undefined !== value" v-model="value"></textarea>
  <component :disabled :class="classes" v-else is="textarea">
    <slot />
  </component>
</template>

<script setup lang="ts">
type Props = {
  disabled?: boolean
  noBorder?: boolean
  noPadding?: boolean
  noRounded?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
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
    'focus:ring-2',
    'focus:ring-primary-500/20',
    'disabled:cursor-not-allowed',
    'disabled:bg-gray-100',
    'disabled:text-gray-500',
  ]

  if (!props.noBorder) classes.push('border')
  if (!props.noPadding) classes.push('py-1.5', 'px-4')
  if (!props.noRounded) classes.push('rounded-lg')

  return classes
})
const value = defineModel<string | undefined>()
</script>
