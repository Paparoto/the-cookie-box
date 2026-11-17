<template>
  <div class="home">
    <h1>Welcome to The Cookie Box</h1>
    <p>Handcrafted, artisanal cookies baked fresh daily.</p>
    <router-link to="/menu" class="cta-btn">Browse Our Menu 🍪</router-link>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
  padding: 4rem 1rem;
}
h1 {
  font-size: 2.8rem;
  color: #5c3d2e;
  margin-bottom: 1rem;
}
p {
  font-size: 1.2rem;
  color: #777;
  margin-bottom: 2rem;
}
.cta-btn {
  display: inline-block;
  background-color: #e76f51;
  color: white;
  padding: 0.8rem 1.6rem;
  text-decoration: none;
  font-size: 1.1rem;
  border-radius: 6px;
  font-weight: bold;
}
</style>