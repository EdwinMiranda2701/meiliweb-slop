<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
    <div :class="horizontalScroll ? 'overflow-x-auto' : ''">
      <table
        :class="horizontalScroll ? 'w-max min-w-full' : autoLayout ? 'w-full table-auto' : 'w-full table-fixed'"
        class="text-left">
        <thead class="border-b border-gray-200 bg-gray-50/80">
          <slot name="head">
            <tr class="*:px-4 *:py-3 *:text-left *:text-xs *:font-semibold *:tracking-wide *:text-gray-600 *:uppercase">
              <slot name="columns">
                <template v-for="(key, index) of columns ?? keys">
                  <th v-if="0 === index" scope="col">{{ key }}</th>
                  <th v-else scope="col" class="whitespace-nowrap">
                    {{ key }}
                  </th>
                </template>
              </slot>
            </tr>
          </slot>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr
            v-for="(item, rowIndex) of items"
            :key="rowIndex"
            class="transition-colors *:px-4 *:py-3.5 *:align-top *:text-sm *:text-gray-700 hover:bg-gray-50/70">
            <slot :item="item" :index="rowIndex">
              <template v-for="(key, index) of keys">
                <td v-if="0 === index" class="font-medium text-gray-900">{{ item[key] }}</td>
                <td v-else>
                  {{ item[key] }}
                </td>
              </template>
            </slot>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  items?: Array<any>
  keys?: Array<string>
  columns?: Array<string>
  horizontalScroll?: boolean
  autoLayout?: boolean
}

const props = withDefaults(defineProps<Props>(), { items: () => [], horizontalScroll: false, autoLayout: false })

const self = reactive({
  keys: computed(() => props.keys ?? Object.keys(props.items[0] ?? {})),
})

const { keys } = toRefs(self)
</script>
