const express = require('express');
const { Cookie } = require('../models');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public: Get all available cookies for the menu
router.get('/', async (req, res) => {
  try {
    const cookies = await Cookie.findAll();
    res.json(cookies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected: Add a new cookie flavor (ADMIN ONLY)
router.post('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, imageUrl, isAvailable } = req.body;
    const newCookie = await Cookie.create({
      name,
      description,
      price,
      imageUrl,
      isAvailable
    });
    res.status(201).json(newCookie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;