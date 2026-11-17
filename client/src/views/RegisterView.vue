<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authState } from '../stores/auth';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');

async function onRegister() {
  errorMessage.value = '';
  try {
    await authState.register(name.value, email.value, password.value);
    await authState.login(email.value, password.value);
    router.push('/menu');
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Registration failed';
  }
}
</script>

<template>
  <div class="auth-card">
    <h2>Create an Account</h2>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <form @submit.prevent="onRegister">
      <div class="form-group">
        <label>Full Name</label>
        <input v-model="name" type="text" required placeholder="John Doe" />
      </div>

      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" required placeholder="you@example.com" />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" required placeholder="••••••••" />
      </div>

      <button type="submit" class="submit-btn">Register</button>
    </form>
  </div>
</template>

<style scoped>
.auth-card {
  max-width: 400px;
  margin: 3rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.08);
}
h2 {
  margin-bottom: 1rem;
  color: #5c3d2e;
}
.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}
label {
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}
input {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.submit-btn {
  width: 100%;
  background: #e76f51;
  color: white;
  border: none;
  padding: 0.7rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
.error {
  color: red;
  margin-bottom: 1rem;
}
</style>