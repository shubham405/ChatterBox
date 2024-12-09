const express = require('express');
const router = express.Router();
const {registerUser, authUser, searchUser} = require('../controllers/userControllers');
const protect = require('../middleware/authMiddleware');
router.route('/').post(registerUser).get(protect,searchUser);
 router.post('/login',authUser);
 
module.exports = router;
