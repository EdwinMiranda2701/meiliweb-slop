<template>
  <Menu v-slot="{ open }" as="div" class="flex items-center justify-end">
    <span ref="trigger" class="inline-flex">
      <slot name="button">
        <MenuButton
          class="focus-visible:ring-primary-500 inline-flex size-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none">
          <span class="sr-only">{{ t('open') }}</span>
          <Icon name="heroicons-solid:dots-vertical" class="size-5" aria-hidden="true" />
        </MenuButton>
      </slot>
    </span>

    <Teleport to="body">
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="scale-95 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-95 opacity-0">
        <MenuItems
          v-if="open"
          ref="menu"
          :style="menuStyle"
          class="[&_[role=menuitem]]:hover:bg-primary-50 fixed z-[100] max-h-[calc(100vh-1rem)] w-52 max-w-[calc(100vw-1rem)] origin-top-right divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 text-sm text-gray-700 shadow-xl focus:outline-none [&_[role=menuitem]]:rounded-lg [&_[role=menuitem]]:transition-colors">
          <slot />
        </MenuItems>
      </transition>
    </Teleport>
  </Menu>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems } from '@headlessui/vue'

const { t } = useI18n()
const trigger = ref<HTMLElement | null>(null)
const menu = ref<{ $el: HTMLElement } | null>(null)
const menuStyle = ref<Record<string, string>>({ visibility: 'hidden' })
const VIEWPORT_GAP = 8
const MENU_GAP = 6

const updatePosition = async () => {
  await nextTick()
  const triggerElement = trigger.value
  const menuElement = menu.value?.$el
  if (!triggerElement || !menuElement) return

  const triggerRect = triggerElement.getBoundingClientRect()
  const menuRect = menuElement.getBoundingClientRect()
  const left = Math.min(
    Math.max(VIEWPORT_GAP, triggerRect.right - menuRect.width),
    window.innerWidth - menuRect.width - VIEWPORT_GAP,
  )
  const fitsBelow = triggerRect.bottom + MENU_GAP + menuRect.height <= window.innerHeight - VIEWPORT_GAP
  const top = fitsBelow
    ? triggerRect.bottom + MENU_GAP
    : Math.max(VIEWPORT_GAP, triggerRect.top - MENU_GAP - menuRect.height)

  menuStyle.value = { left: `${left}px`, top: `${top}px` }
}

onMounted(() => {
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})
watch(menu, (value) => value && updatePosition())
</script>

<i18n>
en:
  open: Open menu
</i18n>
