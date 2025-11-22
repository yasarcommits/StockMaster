const express = require('express');
const router = express.Router();
const dash = require('../controllers/dashboardController');
const auth = require('../middleware/auth');


router.get('/kpis', auth, dash.getKPIs);
router.get('/charts', auth, dash.getDashboardCharts);


module.exports = router;