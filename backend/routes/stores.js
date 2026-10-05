const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/', authorize('user', 'admin'), storeController.getAllStores);
router.post('/rate', authorize('user'), storeController.submitRating);
router.put('/rate', authorize('user'), storeController.updateRating);

module.exports = router;
