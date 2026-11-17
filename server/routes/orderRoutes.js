const express = require('express');
const { Order, OrderItem, Cookie } = require('../models');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// 1. PLACE AN ORDER (Protected: requires login cookie)
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { items, pickupDate } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart cannot be empty.' });
    }
    if (!pickupDate) {
      return res.status(400).json({ message: 'Please select a pickup date.' });
    }

    // Calculate total price directly on server to prevent price tampering
    let totalPrice = 0;
    const verifiedItems = [];

    for (const item of items) {
      const cookie = await Cookie.findByPk(item.cookieId);
      if (!cookie || !cookie.isAvailable) {
        return res.status(400).json({ message: `Cookie ID ${item.cookieId} is unavailable.` });
      }
      totalPrice += Number(cookie.price) * item.quantity;
      verifiedItems.push({
        cookieId: cookie.id,
        quantity: item.quantity,
        priceAtPurchase: cookie.price
      });
    }

    // Create the master Order record
    const newOrder = await Order.create({
      userId: req.user.id,
      totalPrice: totalPrice.toFixed(2),
      pickupDate,
      status: 'pending'
    });

    // Create all the linked OrderItem records
    const orderItemsToCreate = verifiedItems.map(item => ({
      ...item,
      orderId: newOrder.id
    }));
    await OrderItem.bulkCreate(orderItemsToCreate);

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId: newOrder.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET MY ORDERS (Protected: gets only logged-in user's orders)
router.get('/my-orders', authenticateUser, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Cookie,
          through: { attributes: ['quantity', 'priceAtPurchase'] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;