const Product = require('../models/Product');
const Stock = require('../models/Stock');
const StockLocation = require('../models/StockLocation');

async function createProduct(req, res) {
    const { name, sku, category, uom, initialStock, locationId, reorder_level } = req.body;

    if (!name || !sku) {
        return res.status(400).json({ error: 'Missing name or sku' });
    }

    try {
        // Create product
        const p = await Product.create({
            name,
            sku,
            category,
            uom,
            reorder_level
        });

        // If initial stock is provided, update stock table
        if (initialStock && locationId) {

            // check location exists
            const location = await StockLocation.findByPk(locationId);
            if (!location) {
                return res.status(400).json({ error: `Location ${locationId} does not exist` });
            }

            await Stock.create({
                productId: p.id,
                locationId,
                quantity: parseFloat(initialStock)
            });
        }

        res.json(p);

    } catch (err) {
        console.log("🔥 PRODUCT ERROR:", err);   // LOG FULL MYSQL ERROR
        return res.status(500).json({
            error: err.message || 'Database insert error'
        });
    }
}



async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const p = await Product.findByPk(id);

        if (!p) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await p.update(req.body);
        res.json(p);

    } catch (err) {
        console.log("🔥 UPDATE PRODUCT ERROR:", err);
        res.status(500).json({ error: err.message });
    }
}



async function getProducts(req, res) {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (err) {
        console.log("🔥 GET PRODUCTS ERROR:", err);
        res.status(500).json({ error: err.message });
    }
}



async function getProductStock(req, res) {
    try {
        const { productId } = req.params;
        const stocks = await Stock.findAll({
            where: { productId },
            include: [StockLocation]
        });
        res.json(stocks);

    } catch (err) {
        console.log("🔥 GET PRODUCT STOCK ERROR:", err);
        res.status(500).json({ error: err.message });
    }
}


module.exports = { createProduct, updateProduct, getProducts, getProductStock };
