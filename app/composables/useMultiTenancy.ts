export const useMultiTenancy = () => {
  const route = useRoute()

  return reactive({
    tenantToken: computed(() => route.query.tenantToken as string | undefined),
    clearTenantToken: () => {
      const query = { ...toRaw(route.query) }
      delete query.tenantToken
      void navigateTo({
        name: route.name as string,
        params: route.params,
        query,
      })
    },
  })
}
