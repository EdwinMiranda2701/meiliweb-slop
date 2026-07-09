import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'index',
    component: () => import('~/pages/index.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('~/pages/login.vue'),
  },
  {
    path: '/logout',
    name: 'logout',
    component: () => import('~/pages/logout.vue'),
  },
  {
    path: '/indexes',
    name: 'indexes',
    component: () => import('~/pages/indexes/index.vue'),
  },
  {
    path: '/indexes/create',
    name: 'indexes-create',
    component: () => import('~/pages/indexes/create.vue'),
  },
  {
    path: '/indexes/:indexUid/documents',
    name: 'indexes-indexUid-documents',
    component: () => import('~/pages/indexes/[indexUid]/documents/index.vue'),
    props: true,
  },
  {
    path: '/indexes/:indexUid/settings',
    name: 'indexes-indexUid-settings',
    component: () => import('~/pages/indexes/[indexUid]/settings.vue'),
    props: true,
    redirect: (to) => ({
      name: 'indexes-indexUid-settings-general-settings',
      params: to.params,
      query: to.query,
      hash: to.hash,
    }),
    children: [
      {
        path: 'general-settings',
        name: 'indexes-indexUid-settings-general-settings',
        component: () => import('~/pages/indexes/[indexUid]/settings/general-settings.vue'),
        props: true,
      },
      {
        path: 'import-documents',
        name: 'indexes-indexUid-settings-import-documents',
        component: () => import('~/pages/indexes/[indexUid]/settings/import-documents.vue'),
        props: true,
      },
      {
        path: 'filterable-attributes',
        name: 'indexes-indexUid-settings-filterable-attributes',
        component: () => import('~/pages/indexes/[indexUid]/settings/filterable-attributes.vue'),
        props: true,
      },
      {
        path: 'searchable-attributes',
        name: 'indexes-indexUid-settings-searchable-attributes',
        component: () => import('~/pages/indexes/[indexUid]/settings/searchable-attributes.vue'),
        props: true,
      },
      {
        path: 'sortable-attributes',
        name: 'indexes-indexUid-settings-sortable-attributes',
        component: () => import('~/pages/indexes/[indexUid]/settings/sortable-attributes.vue'),
        props: true,
      },
      {
        path: 'displayed-attributes',
        name: 'indexes-indexUid-settings-displayed-attributes',
        component: () => import('~/pages/indexes/[indexUid]/settings/displayed-attributes.vue'),
        props: true,
      },
      {
        path: 'ranking-rules',
        name: 'indexes-indexUid-settings-ranking-rules',
        component: () => import('~/pages/indexes/[indexUid]/settings/ranking-rules.vue'),
        props: true,
      },
      {
        path: 'typo-tolerance',
        name: 'indexes-indexUid-settings-typo-tolerance',
        component: () => import('~/pages/indexes/[indexUid]/settings/typo-tolerance.vue'),
        props: true,
      },
      {
        path: 'dictionary',
        name: 'indexes-indexUid-settings-dictionary',
        component: () => import('~/pages/indexes/[indexUid]/settings/dictionary.vue'),
        props: true,
      },
      {
        path: 'synonyms',
        name: 'indexes-indexUid-settings-synonyms',
        component: () => import('~/pages/indexes/[indexUid]/settings/synonyms.vue'),
        props: true,
      },
      {
        path: 'stop-words',
        name: 'indexes-indexUid-settings-stop-words',
        component: () => import('~/pages/indexes/[indexUid]/settings/stop-words.vue'),
        props: true,
      },
      {
        path: 'separator-tokens',
        name: 'indexes-indexUid-settings-separator-tokens',
        component: () => import('~/pages/indexes/[indexUid]/settings/separator-tokens.vue'),
        props: true,
      },
      {
        path: 'non-separator-tokens',
        name: 'indexes-indexUid-settings-non-separator-tokens',
        component: () => import('~/pages/indexes/[indexUid]/settings/non-separator-tokens.vue'),
        props: true,
      },
      {
        path: 'embedders',
        name: 'indexes-indexUid-settings-embedders',
        component: () => import('~/pages/indexes/[indexUid]/settings/embedders.vue'),
        props: true,
      },
      {
        path: 'foreign-keys',
        name: 'indexes-indexUid-settings-foreign-keys',
        component: () => import('~/pages/indexes/[indexUid]/settings/foreign-keys.vue'),
        props: true,
      },
      {
        path: 'local-settings',
        name: 'indexes-indexUid-settings-local-settings',
        component: () => import('~/pages/indexes/[indexUid]/settings/local-settings.vue'),
        props: true,
      },
    ],
  },
  {
    path: '/keys',
    name: 'keys',
    component: () => import('~/pages/keys/index.vue'),
  },
  {
    path: '/keys/settings',
    name: 'keys-settings',
    component: () => import('~/pages/keys/settings.vue'),
    redirect: (to) => ({
      name: 'keys-settings-create',
      query: to.query,
      hash: to.hash,
    }),
    children: [
      {
        path: 'create',
        name: 'keys-settings-create',
        component: () => import('~/pages/keys/settings/create.vue'),
      },
      {
        path: 'create-token',
        name: 'keys-settings-create-token',
        component: () => import('~/pages/keys/settings/create-token.vue'),
      },
    ],
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('~/pages/tasks/index.vue'),
  },
  {
    path: '/network',
    name: 'network',
    component: () => import('~/pages/network/index.vue'),
  },
  {
    path: '/dumps',
    name: 'dumps',
    component: () => import('~/pages/dumps/index.vue'),
  },
  {
    path: '/snapshots',
    name: 'snapshots',
    component: () => import('~/pages/snapshots/index.vue'),
  },
  {
    path: '/webhooks',
    name: 'webhooks',
    component: () => import('~/pages/webhooks/index.vue'),
  },
  {
    path: '/experimental-features',
    name: 'experimental-features',
    component: () => import('~/pages/experimental-features.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/',
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { left: 0, top: 0 }
  },
})

export default router
