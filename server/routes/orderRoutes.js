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

const { requireAdmin } = require('../middleware/auth');
// 3. GET ALL ORDERS (ADMIN ONLY)
router.get('/all', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: Cookie, through: { attributes: ['quantity', 'priceAtPurchase'] } },
        { model: require('../models').User, attributes: ['name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. UPDATE ORDER STATUS (ADMIN ONLY)
router.patch('/:id/status', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.status = status;
    await order.save();

    res.json({ message: 'Status updated successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. DELETE AN ORDER (ADMIN ONLY)
router.delete('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // 1. Delete associated items first (prevents Foreign Key Constraint errors)
    await OrderItem.destroy({ where: { orderId: req.params.id } });

    // 2. Delete the order
    await order.destroy();

    res.json({ message: 'Order deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;