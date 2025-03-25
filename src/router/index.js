import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/dashboardMain.vue';
import Login from '../views/userLogin.vue';
import CategoryList from '../components/Category/CategoryList.vue';
import CategoryForm from '../components/Category/CategoryForm.vue';
import BrandList from "../components/Brand/BrandList.vue"
import BrandForm from "../components/Brand/BrandForm.vue"
import ProductForm from "../components/Products/ProductForm.vue"
import ProductList from "../components/Products/ProductList.vue"

const routes = [
  { path: '/login', component: Login },
  {
    path: '/dashboard',
    component: Dashboard,
    children: [
      { path: 'categories', component: CategoryList },
      { path: 'categories/create', component: CategoryForm },
      { path: 'categories/edit/:id', component: CategoryForm, props: true },
      { path: 'brands', component: BrandList},
      { path: 'brands/create', component: BrandForm },
      { path: 'brands/edit/:id', component: BrandForm, props: true },
      { path: 'products', component: ProductList},
      { path: 'products/create', component: ProductForm},
      { path: 'products/edit/:id', component: ProductForm, props: true},
    ],
  },
  { path: '/', redirect: '/login' },
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