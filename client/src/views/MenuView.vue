<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const cookies = ref([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const res = await api.get('/cookies');
    cookies.value = res.data;
  } catch (err) {
    error.value = 'Failed to load cookies. Ensure the backend server is running.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="menu-page">
    <h2>Our Freshly Baked Menu</h2>

    <p v-if="loading">Loading delicious cookies...</p>
    <p v-if="error" class="error-msg">{{ error }}</p>

    <div class="cookie-grid" v-if="!loading">
      <div v-for="cookie in cookies" :key="cookie.id" class="cookie-card">
        <img :src="cookie.imageUrl" :alt="cookie.name" class="cookie-img" />
        <div class="cookie-info">
          <h3>{{ cookie.name }}</h3>
          <p class="description">{{ cookie.description }}</p>
          <div class="bottom-row">
            <span class="price">${{ Number(cookie.price).toFixed(2) }}</span>
            <button class="add-btn">Add to Box</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
h2 {
  color: #5c3d2e;
  margin-bottom: 1.5rem;
}
.cookie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}
.cookie-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
}
.cookie-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
.cookie-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.description {
  color: #666;
  font-size: 0.9rem;
  margin: 0.5rem 0 1rem;
  flex-grow: 1;
}
.bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.price {
  font-weight: bold;
  font-size: 1.1rem;
  color: #2a9d8f;
}
.add-btn {
  background: #5c3d2e;
  color: white;
  border: none;
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}
.error-msg {
  color: red;
}
</style>