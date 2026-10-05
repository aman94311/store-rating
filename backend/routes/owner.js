const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.use(authorize('store_owner'));

router.get('/dashboard', ownerController.getDashboard);

module.exports = router;
