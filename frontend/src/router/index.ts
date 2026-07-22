import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/t/demo' },

  {
    path: '/t/:qrToken',
    component: () => import('@/layouts/CustomerLayout.vue'),
    children: [
      { path: '', name: 'menu', component: () => import('@/views/customer/MenuView.vue') },
    ],
  },

  // Kitchen
  {
    path: '/kitchen',
    component: () => import('@/layouts/KitchenLayout.vue'),
    children: [
      { path: '', name: 'kds', component: () => import('@/views/kitchen/KdsBoard.vue') },
    ],
  },

  // Admin
  { path: '/admin/login', name: 'login', component: () => import('@/views/admin/LoginView.vue') },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/menu' },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})