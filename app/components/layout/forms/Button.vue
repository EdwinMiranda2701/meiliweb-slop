<template>
  <Component
    :is="as"
    :type
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55 [&_svg]:size-4"
    :class="themeClasses">
    <template v-if="!iconOnRight">
      <Icon v-if="loading" name="fluent:spinner-ios-16-filled" class="animate-spin" />
      <Icon v-else-if="icon" :name="icon" />
    </template>

    <span v-if="loading">{{ loadingText ?? t('loadingText') }}</span>
    <slot v-else>{{ text }}</slot>

    <template v-if="iconOnRight">
      <Icon v-if="loading" name="fluent:spinner-ios-16-filled" class="animate-spin" />
      <Icon v-else-if="icon" :name="icon" />
    </template>
  </Component>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import match from 'match-operator'

type Props = {
  as?: string | Component
  type?: 'submit' | 'reset' | 'button' | undefined
  theme?: 'primary' | 'secondary'
  icon?: string
  iconOnRight?: boolean
  loading?: boolean
  loadingText?: string
  disabled?: boolean
  noBorder?: boolean
  noPadding?: boolean
  noRounded?: boolean
  size?: 'small'
}
const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  disabled: false,
  loading: false,
  iconOnRight: false,
  noBorder: false,
  noPadding: false,
  noRounded: false,
})
const { t } = useI18n()
const type = computed(() => props.type ?? ('button' === props.as ? 'button' : undefined))
const themeClasses = computed(() => {
  const classes = []
  const primary = 'primary' === props.theme || (!props.theme && 'submit' === props.type)
  const secondary = 'secondary' === props.theme || (!props.theme && 'reset' === props.type)

  if (!props.noBorder) classes.push('border')
  if (!props.noPadding) classes.push(...('small' === props.size ? ['h-8', 'px-2.5'] : ['h-10', 'px-4']))
  if (!props.noRounded) classes.push('rounded-lg')
  classes.push('text-sm')

  if (primary) {
    classes.push(
      'text-white',
      'bg-primary-600',
      'border-primary-600',
      'shadow-xs',
      'focus-visible:ring-primary-500',
      'hover:bg-primary-700',
      'active:bg-primary-800',
      'disabled:hover:bg-primary-600',
    )
  }
  if (secondary || (!primary && !props.noBorder)) {
    classes.push(
      'border-gray-300',
      'bg-white',
      'text-gray-700',
      'shadow-xs',
      'focus-visible:ring-primary-500',
      'enabled:hover:border-gray-400',
      'enabled:hover:bg-gray-50',
      'enabled:active:bg-gray-100',
    )
  } else if (!primary) {
    classes.push('focus-visible:ring-primary-500')
  }

  return classes
})

const text = computed(() =>
  match(props.type ?? 'button', [
    ['submit', t('buttons.submit')],
    ['reset', t('buttons.cancel')],
    [match.default, ''],
  ]),
)
</script>

<i18n>
en:
  loadingText: Please wait...
</i18n>
