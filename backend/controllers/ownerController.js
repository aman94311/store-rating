const { Store, Rating, User } = require('../models');
const sequelize = require('../config/db');

exports.getDashboard = async (req, res) => {
  try {
    const stores = await Store.findAll({
      where: { owner_id: req.user.id }
    });

    if (stores.length === 0) {
      return res.json({
        stores: [],
        message: 'No store assigned to you yet'
      });
    }

    const result = await Promise.all(stores.map(async (store) => {
      const ratings = await Rating.findAll({
        where: { store_id: store.id },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }],
        order: [['createdAt', 'DESC']]
      });

      const avgResult = await Rating.findOne({
        where: { store_id: store.id },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings']
        ],
        raw: true
      });

      return {
        store: {
          id: store.id,
          name: store.name,
          address: store.address,
          email: store.email
        },
        averageRating: avgResult.avgRating ? parseFloat(avgResult.avgRating).toFixed(1) : '0.0',
        totalRatings: parseInt(avgResult.totalRatings) || 0,
        raters: ratings.map(r => ({
          id: r.user.id,
          name: r.user.name,
          email: r.user.email,
          rating: r.rating,
          ratedAt: r.createdAt
        }))
      };
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
