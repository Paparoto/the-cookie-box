import { reactive, computed } from 'vue';

export const cartState = reactive({
  items: [], // Array of { cookie, quantity }

  addItem(cookie) {
    const existing = this.items.find(i => i.cookie.id === cookie.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({ cookie, quantity: 1 });
    }
  },

  removeItem(cookieId) {
    this.items = this.items.filter(i => i.cookie.id !== cookieId);
  },

  updateQuantity(cookieId, quantity) {
    const item = this.items.find(i => i.cookie.id === cookieId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(cookieId);
      } else {
        item.quantity = quantity;
      }
    }
  },

  clearCart() {
    this.items = [];
  },

  totalCount: computed(() => {
    return cartState.items.reduce((sum, item) => sum + item.quantity, 0);
  }),

  totalPrice: computed(() => {
    return cartState.items
      .reduce((sum, item) => sum + item.cookie.price * item.quantity, 0)
      .toFixed(2);
  })
});