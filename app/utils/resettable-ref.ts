import type { ComputedRef, Ref } from 'vue'

const DEFAULT_COMPARE_FN = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)

type ResettableRef<T> = {
  value: Ref<T>
  reset: (newState?: T) => void
  modified: ComputedRef<boolean>
}

export function resettableRef<T>(initialState: T, compareFn: Function = DEFAULT_COMPARE_FN): ResettableRef<T> {
  const $initialState = shallowRef<T>(initialState)
  const handle = ref(structuredClone(toRaw(initialState))) as Ref<T>

  const reset = (newState?: any) => {
    if (undefined !== newState) {
      $initialState.value = structuredClone(toRaw(newState))
    }
    handle.value = structuredClone(toRaw($initialState.value))
  }

  const modified = computed(() => !compareFn(handle.value, $initialState.value))

  return {
    value: handle,
    reset,
    modified,
  }
}
