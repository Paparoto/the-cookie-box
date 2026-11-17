<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { cartState } from '../stores/cart';
import { authState } from '../stores/auth';
import api from '../api/axios';

const router = useRouter();
const pickupDate = ref('');
const error = ref('');
const loading = ref(false);

async function submitOrder() {
  error.value = '';

  if (!authState.isAuthenticated) {
    router.push('/login');
    return;
  }

  if (!pickupDate.value) {
    error.value = 'Please select a pickup date and time.';
    return;
  }

  loading.value = true;
  try {
    const payload = {
      pickupDate: pickupDate.value,
      items: cartState.items.map(i => ({
        cookieId: i.cookie.id,
        quantity: i.quantity
      }))
    };

    await api.post('/orders', payload);
    cartState.clearCart();
    router.push('/my-orders');
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to place order';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="cart-page">
    <h2>Your Custom Cookie Box</h2>

    <div v-if="cartState.items.length === 0" class="empty-cart">
      <p>Your box is empty! Go pick some fresh cookies.</p>
      <router-link to="/menu" class="cta-link">Back to Menu</router-link>
    </div>

    <div v-else class="cart-container">
      <!-- Items List -->
      <div class="cart-items">
        <div v-for="item in cartState.items" :key="item.cookie.id" class="cart-item">
          <img :src="item.cookie.imageUrl" :alt="item.cookie.name" class="thumb" />
          <div class="details">
            <h4>{{ item.cookie.name }}</h4>
            <p>${{ Number(item.cookie.price).toFixed(2) }} each</p>
          </div>
          <div class="quantity-controls">
            <button @click="cartState.updateQuantity(item.cookie.id, item.quantity - 1)">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="cartState.updateQuantity(item.cookie.id, item.quantity + 1)">+</button>
          </div>
          <button @click="cartState.removeItem(item.cookie.id)" class="btn-remove">✕</button>
        </div>
      </div>

      <!-- Checkout Box -->
      <div class="summary-card">
        <h3>Order Summary</h3>
        <p class="summary-line">Total Cookies: <span>{{ cartState.totalCount }}</span></p>
        <p class="summary-line total">Total Price: <span>${{ cartState.totalPrice }}</span></p>

        <div class="form-group">
          <label>Pickup Date & Time:</label>
          <input v-model="pickupDate" type="datetime-local" required />
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button 
          @click="submitOrder" 
          :disabled="loading" 
          class="checkout-btn"
        >
          {{ loading ? 'Placing Order...' : (authState.isAuthenticated ? 'Confirm & Order' : 'Login to Order') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page h2 {
  color: #5c3d2e;
  margin-bottom: 1.5rem;
}
.empty-cart {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
}
.cta-link {
  display: inline-block;
  margin-top: 1rem;
  background: #e76f51;
  color: white;
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 4px;
}
.cart-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}
.cart-items {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}
.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
}
.thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}
.details {
  flex-grow: 1;
}
.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.quantity-controls button {
  width: 28px;
  height: 28px;
  background: #eee;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.btn-remove {
  background: none;
  border: none;
  color: #e76f51;
  font-size: 1.1rem;
  cursor: pointer;
}
.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  height: fit-content;
}
.summary-line {
  display: flex;
  justify-content: space-between;
  margin: 0.8rem 0;
}
.summary-line.total {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2a9d8f;
  border-top: 1px solid #eee;
  padding-top: 0.8rem;
}
.form-group {
  margin: 1.2rem 0;
}
.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
}
.form-group input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.checkout-btn {
  width: 100%;
  background: #e76f51;
  color: white;
  border: none;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
}
.checkout-btn:disabled {
  background: #ccc;
}
.error-msg {
  color: red;
  margin-bottom: 0.8rem;
}
</style>