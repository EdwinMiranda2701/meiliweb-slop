import { ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { router } from '~/router'

export type AppError = Error & {
  statusCode?: number
  statusMessage?: string
  fatal?: boolean
}

type ErrorInput = {
  statusCode?: number
  statusMessage?: string
  message?: string
  fatal?: boolean
}

type NavigationOptions = {
  replace?: boolean
  external?: boolean
}

export const appError = ref<AppError | null>(null)

export const createError = (input: ErrorInput): AppError => {
  const error = new Error(input.statusMessage ?? input.message ?? 'Unexpected error') as AppError
  error.statusCode = input.statusCode
  error.statusMessage = input.statusMessage
  error.fatal = input.fatal
  return error
}

export const showError = (error: unknown) => {
  appError.value = error instanceof Error ? (error as AppError) : createError({ message: String(error) })
}

export const clearError = async ({ redirect }: { redirect?: RouteLocationRaw } = {}) => {
  appError.value = null
  if (redirect) {
    await router.push(redirect)
  }
}

export const navigateTo = async (to: RouteLocationRaw, options: NavigationOptions = {}) => {
  if (options.external) {
    window.location.assign(router.resolve(to).href)
    return
  }

  return options.replace ? router.replace(to) : router.push(to)
}

export const useRuntimeConfig = () => ({
  public: {
    debugMemoryUsage: import.meta.env.VITE_DEBUG_MEMORY_USAGE === 'true',
  },
})
