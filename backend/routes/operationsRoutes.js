const express = require('express');
const router = express.Router();
const ops = require('../controllers/operationsController');
const auth = require('../middleware/auth');

router.post('/receipts', auth, ops.createReceipt);
router.post('/deliveries', auth, ops.createDelivery);
router.post('/transfers', auth, ops.createTransfer);
router.post('/adjustments', auth, ops.createAdjustment);
router.get('/history', auth, ops.getMoveHistory);
router.get('/locations', auth, ops.getLocations);
router.post('/locations', auth, ops.createLocation);

module.exports = router;