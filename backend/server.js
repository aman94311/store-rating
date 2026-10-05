const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, User } = require('./models');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const storeRoutes = require('./routes/stores');
const ownerRoutes = require('./routes/owner');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/owner', ownerRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Store Rating API is running' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync({ force: false });
    console.log('Tables synced');

    // Create default admin if not exists
    const adminExists = await User.findOne({ where: { email: 'admin@store.com' } });
    if (!adminExists) {
      await User.create({
        name: 'System Administrator Account',
        email: 'admin@store.com',
        password: 'Admin@123',
        address: 'Head Office, Main Building, City Center Area',
        role: 'admin'
      });
      console.log('Default admin created: admin@store.com / Admin@123');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
  }
};

startServer();
