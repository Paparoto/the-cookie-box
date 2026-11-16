const sequelize = require('../config/db');
const User = require('./User');
const Cookie = require('./Cookie');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// 1 User has many Orders
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

// An Order has many Cookies through OrderItem
Order.belongsToMany(Cookie, { through: OrderItem, foreignKey: 'orderId' });
Cookie.belongsToMany(Order, { through: OrderItem, foreignKey: 'cookieId' });

// Direct access from OrderItem
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Cookie, { foreignKey: 'cookieId' });

module.exports = {
  sequelize,
  User,
  Cookie,
  Order,
  OrderItem
};