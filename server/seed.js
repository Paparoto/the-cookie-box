const { sequelize, Cookie } = require('./models');

const demoCookies = [
  {
    name: 'Classic Chocolate Chunk',
    description: 'Crispy edges, gooey center with 70% dark chocolate chunks.',
    price: 3.50,
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=500&q=80',
    isAvailable: true
  },
  {
    name: 'Red Velvet White Choc',
    description: 'Rich cocoa red velvet dough packed with white chocolate chips.',
    price: 3.80,
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=500&q=80',
    isAvailable: true
  },
  {
    name: 'Matcha Green Tea',
    description: 'Ceremonial grade matcha infused dough with roasted almonds.',
    price: 4.00,
    imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=500&q=80',
    isAvailable: true
  },
  {
    name: 'Salted Caramel Pecan',
    description: 'Sweet homemade caramel drizzle with crunchy toasted pecans.',
    price: 4.20,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80',
    isAvailable: true
  }
];

async function seed() {
  try {
    await sequelize.sync();
    await Cookie.bulkCreate(demoCookies);
    console.log(' 4 demo cookies added to database!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();