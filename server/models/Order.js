const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  pickupDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'baking', 'ready', 'completed'),
    defaultValue: 'pending'
  }
});

module.exports = Order;