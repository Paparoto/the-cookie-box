<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const orders = ref([]);
const cookies = ref([]);
const loading = ref(true);
const activeTab = ref('orders');

// Form state for creating a new cookie
const newCookie = ref({
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  isAvailable: true
});

async function fetchData() {
  loading.value = true;
  try {
    const [ordersRes, cookiesRes] = await Promise.all([
      api.get('/orders/all'),
      api.get('/cookies')
    ]);
    orders.value = ordersRes.data;
    cookies.value = cookiesRes.data;
  } catch (err) {
    console.error('Failed to load admin data', err);
  } finally {
    loading.value = false;
  }
}

async function updateStatus(orderId, newStatus) {
  try {
    await api.patch(`/orders/${orderId}/status`, { status: newStatus });
    const order = orders.value.find(o => o.id === orderId);
    if (order) order.status = newStatus;
  } catch (err) {
    alert('Failed to update status');
  }
}

async function toggleCookie(cookieId) {
  try {
    const res = await api.patch(`/cookies/${cookieId}/toggle`);
    const cookie = cookies.value.find(c => c.id === cookieId);
    if (cookie) cookie.isAvailable = res.data.cookie.isAvailable;
  } catch (err) {
    alert('Failed to toggle cookie');
  }
}

async function addCookie() {
  try {
    const res = await api.post('/cookies', newCookie.value);
    cookies.value.push(res.data);
    newCookie.value = { name: '', description: '', price: '', imageUrl: '', isAvailable: true };
    alert('Cookie added successfully!');
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to add cookie');
  }
}

onMounted(fetchData);
</script>

<template>
  <div class="admin-page">
    <h2>Admin Dashboard 🛠️</h2>

    <div class="tabs">
      <button :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">Customer Orders</button>
      <button :class="{ active: activeTab === 'cookies' }" @click="activeTab = 'cookies'">Manage Menu</button>
    </div>

    <p v-if="loading">Loading admin data...</p>

    <!-- ORDERS TAB -->
    <div v-else-if="activeTab === 'orders'" class="tab-content">
      <div v-if="orders.length === 0" class="empty-state">No orders placed yet.</div>
      <div v-else class="orders-table-wrapper">
        <table class="styled-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Pickup Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>#{{ order.id }}</td>
              <td>
                <strong>{{ order.User?.name }}</strong><br />
                <small>{{ order.User?.email }}</small>
              </td>
              <td>
                <ul>
                  <li v-for="c in order.Cookies" :key="c.id">
                    {{ c.OrderItem.quantity }}x {{ c.name }}
                  </li>
                </ul>
              </td>
              <td><strong>${{ Number(order.totalPrice).toFixed(2) }}</strong></td>
              <td>{{ new Date(order.pickupDate).toLocaleString() }}</td>
              <td>
                <span :class="['badge', order.status]">{{ order.status.toUpperCase() }}</span>
              </td>
              <td>
                <select :value="order.status" @change="updateStatus(order.id, $event.target.value)">
                  <option value="pending">Pending</option>
                  <option value="baking">Baking</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- COOKIES TAB -->
    <div v-else-if="activeTab === 'cookies'" class="tab-content">
      <div class="admin-columns">
        <!-- Cookie List -->
        <div class="cookie-list">
          <h3>Current Menu Items</h3>
          <div v-for="cookie in cookies" :key="cookie.id" class="cookie-item">
            <span><strong>{{ cookie.name }}</strong> (${{ Number(cookie.price).toFixed(2) }})</span>
            <button 
              :class="['toggle-btn', cookie.isAvailable ? 'btn-available' : 'btn-disabled']"
              @click="toggleCookie(cookie.id)"
            >
              {{ cookie.isAvailable ? 'In Stock' : 'Out of Stock' }}
            </button>
          </div>
        </div>

        <!-- Add New Cookie Form -->
        <div class="cookie-form-card">
          <h3>Add New Flavor</h3>
          <form @submit.prevent="addCookie">
            <input v-model="newCookie.name" placeholder="Cookie Name" required />
            <input v-model="newCookie.price" type="number" step="0.10" placeholder="Price (e.g. 3.50)" required />
            <input v-model="newCookie.imageUrl" placeholder="Image URL" required />
            <textarea v-model="newCookie.description" placeholder="Short description..."></textarea>
            <button type="submit" class="submit-btn">+ Add Flavor</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page h2 { color: #5c3d2e; margin-bottom: 1.5rem; }
.tabs { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.tabs button {
  padding: 0.6rem 1.2rem;
  border: none;
  background: #e0d0c1;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.tabs button.active { background: #5c3d2e; color: white; }
.styled-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.styled-table th, .styled-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}
.styled-table th { background: #f4ede4; color: #5c3d2e; }
.styled-table ul { list-style: none; padding: 0; margin: 0; font-size: 0.9rem; }
.badge { padding: 0.3rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }
.badge.pending { background: #ffeaa7; color: #d63031; }
.badge.baking { background: #dfe6e9; color: #2d3436; }
.badge.ready { background: #55efc4; color: #00b894; }
.badge.completed { background: #b2bec3; color: #2d3436; }
select { padding: 0.4rem; border-radius: 4px; border: 1px solid #ccc; }

.admin-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.cookie-list, .cookie-form-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.cookie-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid #eee;
}
.toggle-btn {
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.btn-available { background: #e8f8f5; color: #27ae60; }
.btn-disabled { background: #fdedec; color: #e74c3c; }

.cookie-form-card form { display: flex; flex-direction: column; gap: 0.8rem; margin-top: 1rem; }
.cookie-form-card input, .cookie-form-card textarea {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.submit-btn {
  background: #e76f51;
  color: white;
  border: none;
  padding: 0.7rem;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
}
</style>