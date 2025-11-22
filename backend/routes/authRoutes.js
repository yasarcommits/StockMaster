const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const auth = require('../middleware/auth');


router.post('/signup', authCtrl.signup);
router.post('/login', authCtrl.login);
router.post('/request-password-reset', authCtrl.requestPasswordReset);
router.post('/verify-otp-reset', authCtrl.verifyOtpAndReset);
router.put('/profile', auth, authCtrl.updateProfile);
router.get('/me', auth, authCtrl.getMe);


module.exports = router;