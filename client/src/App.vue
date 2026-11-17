<script setup>
import { onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import { authState } from './stores/auth';

onMounted(() => {
  authState.checkAuth();
});
</script>

<template>
  <div class="app-container">
    <Navbar />
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}
body {
  background-color: #fcf8f2;
  color: #333;
}
.content {
  padding: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}
</style>