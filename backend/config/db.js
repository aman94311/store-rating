const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'railway',
  'root',
  'SVxSUSJfnMjTUFKUrVfwUzgIMNaSzyNu',
  {
    host: 'altaria.proxy.rlwy.net',
    port: 10712,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      connectTimeout: 60000
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('🎉 SUCCESS: Connected to Railway MySQL database via Sequelize!');
  })
  .catch(err => {
    console.error('❌ Connection Failed:', err.message);
  });

module.exports = sequelize;
