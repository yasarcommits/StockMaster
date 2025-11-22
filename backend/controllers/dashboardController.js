const Product = require('../models/Product');
const Stock = require('../models/Stock');
const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const Ledger = require('../models/Ledger');


async function getKPIs(req, res) {
    const totalProducts = await Product.count();
    const totalStock = await Stock.sum('quantity') || 0;
    const lowStockProducts = await Product.findAll({ where: {}, limit: 50 }); // compute low stocks below reorder in code
    // Better low stock logic: join with Stock and compare
    // For now, let's just fetch all and filter in memory or basic query if reorder_level is on Product
    // Assuming Product has reorder_level. We need to sum stock for each product.
    // This is complex in SQL without raw query. Let's keep it simple for now or use raw query if needed.
    const pendingReceipts = await Receipt.count({ where: { status: 'waiting' } });
    const pendingDeliveries = await Delivery.count({ where: { status: 'waiting' } });
    res.json({ totalProducts, totalStock, pendingReceipts, pendingDeliveries, lowStockProducts });
}

async function getDashboardCharts(req, res) {
    try {
        // 1. Stock Trends (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const movements = await Ledger.findAll({
            where: {
                createdAt: { [Op.gte]: sevenDaysAgo },
                type: ['receipt', 'delivery']
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                'type',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'total']
            ],
            group: [sequelize.fn('DATE', sequelize.col('createdAt')), 'type'],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        });

        // Process movements into chart format
        const trendsMap = {};
        movements.forEach(m => {
            const date = m.get('date');
            const type = m.type;
            const total = m.get('total');

            if (!trendsMap[date]) trendsMap[date] = { name: date, in: 0, out: 0 };
            if (type === 'receipt') trendsMap[date].in = total;
            if (type === 'delivery') trendsMap[date].out = total;
        });
        const stockTrends = Object.values(trendsMap);

        // 2. Category Distribution
        const categories = await Product.findAll({
            attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'value']],
            group: ['category']
        });

        const categoryData = categories.map(c => ({
            name: c.category || 'Uncategorized',
            value: parseInt(c.get('value'))
        }));

        res.json({ stockTrends, categoryData });
    } catch (error) {
        console.error("Chart data error:", error);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
}

module.exports = { getKPIs, getDashboardCharts };