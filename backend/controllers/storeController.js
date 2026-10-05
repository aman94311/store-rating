const { Store, Rating, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

exports.getAllStores = async (req, res) => {
  try {
    const { name, address, sortBy = 'name', order = 'ASC' } = req.query;

    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };

    const validSort = ['name', 'address', 'createdAt'];
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

    // Get current user's ratings
    const userRatings = await Rating.findAll({
      where: { user_id: req.user.id },
      attributes: ['store_id', 'rating']
    });

    const userRatingMap = {};
    userRatings.forEach(r => {
      userRatingMap[r.store_id] = r.rating;
    });

    const result = stores.map(s => ({
      id: s.id,
      name: s.name,
      address: s.address,
      overallRating: s.dataValues.avgRating ? parseFloat(s.dataValues.avgRating).toFixed(1) : '0.0',
      ratingCount: parseInt(s.dataValues.ratingCount) || 0,
      userRating: userRatingMap[s.id] || null
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.submitRating = async (req, res) => {
  try {
    const { store_id, rating } = req.body;

    if (!store_id || !rating) {
      return res.status(400).json({ message: 'Store ID and rating are required' });
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(Number(rating))) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    const store = await Store.findByPk(store_id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const existing = await Rating.findOne({
      where: {
        user_id: req.user.id,
        store_id
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already rated this store. Use update instead.' });
    }

    const newRating = await Rating.create({
      user_id: req.user.id,
      store_id,
      rating: Number(rating)
    });

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: newRating
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateRating = async (req, res) => {
  try {
    const { store_id, rating } = req.body;

    if (!store_id || !rating) {
      return res.status(400).json({ message: 'Store ID and rating are required' });
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(Number(rating))) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    const existing = await Rating.findOne({
      where: {
        user_id: req.user.id,
        store_id
      }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Rating not found. Submit a new rating first.' });
    }

    existing.rating = Number(rating);
    await existing.save();

    res.json({
      message: 'Rating updated successfully',
      rating: existing
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
