const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.use(authorize('admin'));

router.get('/dashboard', adminController.getDashboard);
router.post('/users', adminController.addUser);
router.post('/stores', adminController.addStore);
router.get('/stores', adminController.getStores);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);

module.exports = router;
