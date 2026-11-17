<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const orders = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await api.get('/orders/my-orders');
    orders.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="orders-page">
    <h2>My Order History</h2>

    <p v-if="loading">Loading your orders...</p>

    <div v-else-if="orders.length === 0" class="no-orders">
      <p>You haven't placed any cookie orders yet.</p>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div>
            <strong>Order #{{ order.id }}</strong>
            <p class="pickup-text">Pickup: {{ new Date(order.pickupDate).toLocaleString() }}</p>
          </div>
          <span :class="['badge', order.status]">{{ order.status.toUpperCase() }}</span>
        </div>

        <ul class="order-cookies">
          <li v-for="cookie in order.Cookies" :key="cookie.id">
            {{ cookie.OrderItem.quantity }}x {{ cookie.name }} 
            (${{ Number(cookie.OrderItem.priceAtPurchase).toFixed(2) }} ea)
          </li>
        </ul>

        <div class="order-footer">
          <span>Total Paid:</span>
          <strong>${{ Number(order.totalPrice).toFixed(2) }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-page h2 {
  color: #5c3d2e;
  margin-bottom: 1.5rem;
}
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.order-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.8rem;
}
.pickup-text {
  font-size: 0.85rem;
  color: #666;
}
.badge {
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}
.badge.pending { background: #ffeaa7; color: #d63031; }
.badge.baking { background: #dfe6e9; color: #2d3436; }
.badge.ready { background: #55efc4; color: #00b894; }
.badge.completed { background: #b2bec3; color: #2d3436; }
.order-cookies {
  list-style: none;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}
.order-cookies li {
  margin-bottom: 0.4rem;
}
.order-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 0.8rem;
  font-size: 1.1rem;
}
.no-orders {
  background: white;
  padding: 2rem;
  text-align: center;
  border-radius: 8px;
}
</style>