import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import MenuView from '../views/MenuView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import CartView from '../views/CartView.vue';
import MyOrdersView from '../views/MyOrdersView.vue';
import AdminView from '../views/AdminView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/menu', name: 'menu', component: MenuView },
  { path: '/cart', name: 'cart', component: CartView },
  { path: '/my-orders', name: 'my-orders', component: MyOrdersView },
  { path: '/admin', name: 'admin', component: AdminView }, // <-- ADD
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;