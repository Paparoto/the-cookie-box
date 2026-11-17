<script setup>
import { useRouter } from 'vue-router';
import { authState } from '../stores/auth';

const router = useRouter();

async function handleLogout() {
  await authState.logout();
  router.push('/login');
}
</script>

<template>
  <nav class="navbar">
    <div class="logo">
      <router-link to="/">🍪 The Cookie Box</router-link>
    </div>
    <div class="links">
      <router-link to="/">Home</router-link>
      <router-link to="/menu">Menu</router-link>

      <!-- If Logged In -->
      <template v-if="authState.isAuthenticated">
        <span class="user-greeting">Hi, {{ authState.user?.name }}!</span>
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </template>

      <!-- If Not Logged In -->
      <template v-else>
        <router-link to="/login">Login</router-link>
        <router-link to="/register" class="btn-primary">Register</router-link>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #5c3d2e;
  color: white;
}
.logo a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #f7ede2;
  text-decoration: none;
}
.links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.links a {
  color: #f7ede2;
  text-decoration: none;
  font-weight: 500;
}
.user-greeting {
  font-weight: bold;
  color: #f4a261;
}
.btn-logout {
  background: none;
  border: 1px solid #f7ede2;
  color: #f7ede2;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}
.btn-primary {
  background-color: #e76f51;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  color: white !important;
}
</style>