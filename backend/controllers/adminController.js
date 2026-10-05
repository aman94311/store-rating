const { User, Store, Rating } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    res.json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!name || !email || !password || !address || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: 'Name must be between 20 and 60 characters' });
    }

    if (address.length > 400) {
      return res.status(400).json({ message: 'Address cannot exceed 400 characters' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be 8-16 characters with at least one uppercase letter and one special character' 
      });
    }

    if (!['admin', 'user', 'store_owner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      address,
      role
    });

    res.status(201).json({
      message: 'User added successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    if (!name || !email || !address) {
      return res.status(400).json({ message: 'Name, email and address are required' });
    }

    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: 'Name must be between 20 and 60 characters' });
    }

    if (address.length > 400) {
      return res.status(400).json({ message: 'Address cannot exceed 400 characters' });
    }

    const existing = await Store.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Store email already exists' });
    }

    if (owner_id) {
      const owner = await User.findByPk(owner_id);
      if (!owner || owner.role !== 'store_owner') {
        return res.status(400).json({ message: 'Invalid store owner' });
      }
    }

    const store = await Store.create({
      name,
      email,
      address,
      owner_id: owner_id || null
    });

    res.status(201).json({
      message: 'Store added successfully',
      store
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', order = 'ASC' } = req.query;
    
    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };

    const validSort = ['name', 'email', 'address', 'createdAt'];
    const sortField = validSort.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const stores = await Store.findAll({
      where,
      order: [[sortField, sortOrder]],
      include: [
        {
          model: Rating,
          as: 'ratings',
          attributes: []
        }
      ],
      attributes: {
        include: [
          [sequelize.fn('AVG', sequelize.col('ratings.rating')), 'avgRating'],
          [sequelize.fn('COUNT', sequelize.col('ratings.id')), 'ratingCount']
        ]
      },
      group: ['Store.id']
    });

    const result = stores.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      rating: s.dataValues.avgRating ? parseFloat(s.dataValues.avgRating).toFixed(1) : '0.0',
      ratingCount: parseInt(s.dataValues.ratingCount) || 0
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', order = 'ASC' } = req.query;

    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };
    if (role) where.role = role;

    const validSort = ['name', 'email', 'address', 'role', 'createdAt'];
    const sortField = validSort.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const users = await User.findAll({
      where,
      order: [[sortField, sortOrder]],
      attributes: { exclude: ['password'] }
    });

    // For store owners, get their store rating
    const result = await Promise.all(users.map(async (user) => {
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      };

      if (user.role === 'store_owner') {
        const stores = await Store.findAll({
          where: { owner_id: user.id },
          include: [{
            model: Rating,
            as: 'ratings',
            attributes: []
          }],
          attributes: {
            include: [
              [sequelize.fn('AVG', sequelize.col('ratings.rating')), 'avgRating']
            ]
          },
          group: ['Store.id']
        });

        if (stores.length > 0 && stores[0].dataValues.avgRating) {
          userData.rating = parseFloat(stores[0].dataValues.avgRating).toFixed(1);
        } else {
          userData.rating = '0.0';
        }
      }

      return userData;
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role
    };

    if (user.role === 'store_owner') {
      const stores = await Store.findAll({
        where: { owner_id: user.id },
        include: [{
          model: Rating,
          as: 'ratings',
          attributes: []
        }],
        attributes: {
          include: [
            [sequelize.fn('AVG', sequelize.col('ratings.rating')), 'avgRating']
          ]
        },
        group: ['Store.id']
      });

      if (stores.length > 0 && stores[0].dataValues.avgRating) {
        userData.rating = parseFloat(stores[0].dataValues.avgRating).toFixed(1);
      } else {
        userData.rating = '0.0';
      }
      userData.stores = stores.map(s => ({
        id: s.id,
        name: s.name,
        address: s.address
      }));
    }

    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
