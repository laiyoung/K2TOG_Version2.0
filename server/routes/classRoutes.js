const express = require('express');
const router = express.Router();

const {
  getAllClasses,
  getSingleClass,
  createNewClass
} = require('../controllers/classController');

const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', getAllClasses);
router.get('/:id', getSingleClass);
router.post('/', requireAuth, requireAdmin, createNewClass); // admin only

module.exports = router;
