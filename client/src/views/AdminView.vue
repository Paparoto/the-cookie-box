<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const orders = ref([]);
const cookies = ref([]);
const loading = ref(true);
const activeTab = ref('cookies');
const formMessage = ref('');
const formError = ref('');

// Form state
const editingCookieId = ref(null);
const cookieForm = ref({
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  isAvailable: true
});

let draggedIndex = null;

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

// 1. CREATE OR UPDATE COOKIE
async function handleSubmitCookie() {
  formMessage.value = '';
  formError.value = '';

  try {
    if (editingCookieId.value) {
      // UPDATE existing cookie
      const res = await api.put(`/cookies/${editingCookieId.value}`, cookieForm.value);
      const index = cookies.value.findIndex(c => c.id === editingCookieId.value);
      if (index !== -1) cookies.value[index] = res.data.cookie;
      formMessage.value = `"${res.data.cookie.name}" updated successfully!`;
      cancelEdit();
    } else {
      // CREATE new cookie
      const res = await api.post('/cookies', cookieForm.value);
      cookies.value.push(res.data);
      formMessage.value = `"${res.data.name}" added to menu!`;
      resetForm();
    }
  } catch (err) {
    formError.value = err.response?.data?.message || 'Operation failed.';
  }
}

function startEdit(cookie) {
  editingCookieId.value = cookie.id;
  cookieForm.value = {
    name: cookie.name,
    description: cookie.description || '',
    price: cookie.price,
    imageUrl: cookie.imageUrl || '',
    isAvailable: cookie.isAvailable
  };
  formMessage.value = '';
  formError.value = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
  editingCookieId.value = null;
  resetForm();
}

function resetForm() {
  cookieForm.value = {
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    isAvailable: true
  };
}

// 2. TOGGLE AVAILABILITY
async function toggleCookie(cookieId) {
  try {
    const res = await api.patch(`/cookies/${cookieId}/toggle`);
    const cookie = cookies.value.find(c => c.id === cookieId);
    if (cookie) cookie.isAvailable = res.data.cookie.isAvailable;
  } catch (err) {
    alert('Failed to toggle availability.');
  }
}

// 3. DELETE COOKIE
async function deleteCookie(cookieId) {
  if (!confirm('Are you sure you want to permanently delete this cookie?')) return;

  try {
    await api.delete(`/cookies/${cookieId}`);
    cookies.value = cookies.value.filter(c => c.id !== cookieId);
    if (editingCookieId.value === cookieId) cancelEdit();
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete cookie.');
  }
}

// 4. DRAG & DROP REORDERING
function onDragStart(index) {
  draggedIndex = index;
}

async function onDrop(targetIndex) {
  if (draggedIndex === null || draggedIndex === targetIndex) return;
  const movedItem = cookies.value.splice(draggedIndex, 1)[0];
  cookies.value.splice(targetIndex, 0, movedItem);
  draggedIndex = null;

  try {
    const orderedIds = cookies.value.map(c => c.id);
    await api.put('/cookies/reorder', { orderedIds });
  } catch (err) {
    console.error(err);
    alert('Failed to save new order.');
  }
}

// 5. UPDATE ORDER STATUS
async function updateStatus(orderId, newStatus) {
  try {
    await api.patch(`/orders/${orderId}/status`, { status: newStatus });
    const order = orders.value.find(o => o.id === orderId);
    if (order) order.status = newStatus;
  } catch (err) {
    alert('Failed to update status.');
  }
}

// 6. DELETE ORDER
async function deleteOrder(orderId) {
  if (!confirm(`Are you sure you want to delete Order #${orderId}?`)) return;

  try {
    await api.delete(`/orders/${orderId}`);
    orders.value = orders.value.filter(o => o.id !== orderId);
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete order.');
  }
}

onMounted(fetchData);
</script>

<template>
  <div class="admin-page">
    <h2>Admin Dashboard 🛠️</h2>

    <!-- Navigation Tabs -->
    <div class="tabs">
      <button :class="{ active: activeTab === 'cookies' }" @click="activeTab = 'cookies'">
        Manage Menu & Cookies
      </button>
      <button :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">
        Customer Orders ({{ orders.length }})
      </button>
    </div>

    <p v-if="loading">Loading admin data...</p>

    <!-- TAB 1: COOKIES & MENU -->
    <div v-else-if="activeTab === 'cookies'" class="tab-content">
      <div class="admin-grid">

        <!-- Form: Add or Edit -->
        <div class="card form-card">
          <h3>
            {{ editingCookieId ? '✏️ Edit Cookie' : '🍪 Add a New Cookie Flavor' }}
          </h3>

          <p v-if="formMessage" class="success-msg">{{ formMessage }}</p>
          <p v-if="formError" class="error-msg">{{ formError }}</p>

          <form @submit.prevent="handleSubmitCookie">
            <div class="form-group">
              <label>Flavor Name</label>
              <input v-model="cookieForm.name" required placeholder="e.g. Pistachio Raspberry" />
            </div>

            <div class="form-group">
              <label>Price ($)</label>
              <input v-model="cookieForm.price" type="number" step="0.05" min="0.5" required placeholder="e.g. 4.20" />
            </div>

            <div class="form-group">
              <label>Image URL</label>
              <input v-model="cookieForm.imageUrl" type="url" required placeholder="https://..." />
            </div>

            <div v-if="cookieForm.imageUrl" class="preview-box">
              <small>Image Preview:</small>
              <img :src="cookieForm.imageUrl" alt="Preview" class="preview-img" />
            </div>

            <div class="form-group">
              <label>Description & Ingredients</label>
              <textarea v-model="cookieForm.description" rows="3" placeholder="Soft-baked cookie filled with..."></textarea>
            </div>

            <div class="btn-group">
              <button type="submit" class="submit-btn">
                {{ editingCookieId ? 'Save Changes 💾' : '+ Add Cookie to Menu' }}
              </button>
              <button v-if="editingCookieId" type="button" @click="cancelEdit" class="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>

        <!-- Inventory List -->
        <div class="card list-card">
          <h3>Current Menu ({{ cookies.length }})</h3>
          <p class="hint">💡 Grab the ☰ icon to drag and reorder items.</p>

          <div class="cookie-items">
            <div 
              v-for="(cookie, index) in cookies" 
              :key="cookie.id" 
              class="cookie-row draggable"
              :class="{ 'editing-highlight': cookie.id === editingCookieId }"
              draggable="true"
              @dragstart="onDragStart(index)"
              @dragover.prevent
              @drop="onDrop(index)"
            >
              <span class="drag-handle" title="Drag to reorder">☰</span>
              <img :src="cookie.imageUrl" :alt="cookie.name" class="cookie-thumb" />

              <div class="cookie-details">
                <h4>{{ cookie.name }}</h4>
                <span class="price">${{ Number(cookie.price).toFixed(2) }}</span>
              </div>

              <div class="actions">
                <!-- Toggle stock -->
                <button 
                  :class="['toggle-btn', cookie.isAvailable ? 'btn-available' : 'btn-disabled']"
                  @click="toggleCookie(cookie.id)"
                >
                  {{ cookie.isAvailable ? 'In Stock' : 'Out of Stock' }}
                </button>

                <!-- Edit Button -->
                <button @click="startEdit(cookie)" class="btn-icon" title="Edit Cookie">
                  ✏️
                </button>

                <!-- Delete Button -->
                <button @click="deleteCookie(cookie.id)" class="btn-icon" title="Delete Cookie">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- TAB 2: ORDERS -->
    <div v-else-if="activeTab === 'orders'" class="tab-content">
      <div v-if="orders.length === 0" class="empty-state">No orders placed yet.</div>
      <table v-else class="styled-table">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Pickup Date</th>
            <th>Status</th>
            <th>Actions</th>
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
              <div class="order-actions">
                <select :value="order.status" @change="updateStatus(order.id, $event.target.value)">
                  <option value="pending">Pending</option>
                  <option value="baking">Baking</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                </select>
                <!-- Delete Order Button -->
                <button @click="deleteOrder(order.id)" class="btn-icon" title="Delete Order">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped>
.admin-page h2 { color: #5c3d2e; margin-bottom: 1.5rem; }
.tabs { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.tabs button {
  padding: 0.7rem 1.4rem;
  border: none;
  background: #e0d0c1;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.tabs button.active { background: #5c3d2e; color: white; }

.admin-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 2rem; }
.card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.06);
}
.card h3 { color: #5c3d2e; margin-bottom: 0.8rem; }
.hint { font-size: 0.85rem; color: #888; margin-bottom: 1rem; }

.form-group { margin-bottom: 1rem; display: flex; flex-direction: column; }
.form-group label { font-size: 0.85rem; font-weight: bold; margin-bottom: 0.3rem; }
.form-group input, .form-group textarea {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.preview-box { margin-bottom: 1rem; }
.preview-img { width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-top: 0.3rem; }

.btn-group { display: flex; gap: 0.5rem; }
.submit-btn {
  flex-grow: 1;
  background: #e76f51;
  color: white;
  border: none;
  padding: 0.8rem;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
}
.cancel-btn {
  background: #ccc;
  border: none;
  padding: 0.8rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.success-msg { color: #27ae60; font-weight: bold; margin-bottom: 1rem; }
.error-msg { color: #e74c3c; font-weight: bold; margin-bottom: 1rem; }

.cookie-items { display: flex; flex-direction: column; gap: 0.8rem; max-height: 550px; overflow-y: auto; }
.cookie-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  border-bottom: 1px solid #eee;
  border-radius: 4px;
}
.cookie-row.editing-highlight {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
}
.cookie-row.draggable { cursor: grab; }
.drag-handle { font-size: 1.3rem; color: #aaa; cursor: grab; user-select: none; }
.drag-handle:hover { color: #5c3d2e; }

.cookie-thumb { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; }
.cookie-details { flex-grow: 1; }
.cookie-details h4 { font-size: 0.95rem; margin-bottom: 0.2rem; }
.cookie-details .price { color: #2a9d8f; font-weight: bold; font-size: 0.9rem; }

.actions { display: flex; align-items: center; gap: 0.4rem; }
.toggle-btn {
  padding: 0.4rem 0.6rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
}
.btn-available { background: #e8f8f5; color: #27ae60; }
.btn-disabled { background: #fdedec; color: #e74c3c; }
.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.2rem;
}

.styled-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
.styled-table th, .styled-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #eee; }
.styled-table th { background: #f4ede4; color: #5c3d2e; }
.styled-table ul { list-style: none; padding: 0; margin: 0; font-size: 0.85rem; }
.badge { padding: 0.3rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }
.badge.pending { background: #ffeaa7; color: #d63031; }
.badge.baking { background: #dfe6e9; color: #2d3436; }
.badge.ready { background: #55efc4; color: #00b894; }
.badge.completed { background: #b2bec3; color: #2d3436; }
.order-actions { display: flex; align-items: center; gap: 0.5rem; }
select { padding: 0.4rem; border-radius: 4px; border: 1px solid #ccc; }
</style>