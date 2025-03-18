import { createRouter, createWebHistory } from 'vue-router';
import LoginView  from '../views/userLogin.vue';
import Dashboard from '../views/dashboardMain.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name:"login", component: LoginView  },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware para proteger rutas
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;