const Receipt = require('../models/Receipt');
const ReceiptItem = require('../models/ReceiptItem');
const Delivery = require('../models/Delivery');
const DeliveryItem = require('../models/DeliveryItem');
const Transfer = require('../models/Transfer');
const TransferItem = require('../models/TransferItem');
const Adjustment = require('../models/Adjustment');
const Ledger = require('../models/Ledger');
const Stock = require('../models/Stock');
const StockLocation = require('../models/StockLocation');

async function createReceipt(req, res) {
    const { supplier, items } = req.body; // items: [{productId, quantity, locationId}]
    const receipt = await Receipt.create({ supplier, createdBy: req.user.id, status: 'ready' });
    for (const it of items) {
        await ReceiptItem.create({ receiptId: receipt.id, productId: it.productId, quantity: it.quantity, locationId: it.locationId });
        // increase stock
        const [stock] = await Stock.findOrCreate({ where: { productId: it.productId, locationId: it.locationId }, defaults: { quantity: 0 } });
        stock.quantity = parseFloat(stock.quantity) + parseFloat(it.quantity);
        await stock.save();
        await Ledger.create({ type: 'receipt', refId: receipt.id, productId: it.productId, toLocationId: it.locationId, quantity: it.quantity });
    }
    receipt.status = 'done';
    await receipt.save();
    res.json(receipt);
}

async function createDelivery(req, res) {
    const { customer, items } = req.body; // items: [{productId, quantity, locationId}]
    const delivery = await Delivery.create({ customer, createdBy: req.user.id, status: 'ready' });
    for (const it of items) {
        const [stock] = await Stock.findOrCreate({ where: { productId: it.productId, locationId: it.locationId }, defaults: { quantity: 0 } });
        if (parseFloat(stock.quantity) < parseFloat(it.quantity)) return res.status(400).json({ error: `Insufficient stock for product ${it.productId} at location ${it.locationId}` });
        stock.quantity = parseFloat(stock.quantity) - parseFloat(it.quantity);
        await stock.save();
        await DeliveryItem.create({ deliveryId: delivery.id, productId: it.productId, quantity: it.quantity, locationId: it.locationId });
        await Ledger.create({ type: 'delivery', refId: delivery.id, productId: it.productId, fromLocationId: it.locationId, quantity: it.quantity });
    }
    delivery.status = 'done';
    await delivery.save();
    res.json(delivery);
}

async function createTransfer(req, res) {
    const { items } = req.body; // items: [{productId, quantity, fromLocationId, toLocationId}]
    const transfer = await Transfer.create({ status: 'ready' });
    for (const it of items) {
        const [stockFrom] = await Stock.findOrCreate({ where: { productId: it.productId, locationId: it.fromLocationId }, defaults: { quantity: 0 } });
        if (parseFloat(stockFrom.quantity) < parseFloat(it.quantity)) return res.status(400).json({ error: `Insufficient stock in fromLocation ${it.fromLocationId}` });
        stockFrom.quantity = parseFloat(stockFrom.quantity) - parseFloat(it.quantity);
        await stockFrom.save();
        const [stockTo] = await Stock.findOrCreate({ where: { productId: it.productId, locationId: it.toLocationId }, defaults: { quantity: 0 } });
        stockTo.quantity = parseFloat(stockTo.quantity) + parseFloat(it.quantity);
        await stockTo.save();
        await TransferItem.create({ transferId: transfer.id, productId: it.productId, quantity: it.quantity, fromLocationId: it.fromLocationId, toLocationId: it.toLocationId });
        await Ledger.create({ type: 'transfer', refId: transfer.id, productId: it.productId, fromLocationId: it.fromLocationId, toLocationId: it.toLocationId, quantity: it.quantity });
    }
    transfer.status = 'done';
    await transfer.save();
    res.json(transfer);
}

async function createAdjustment(req, res) {
    const { productId, locationId, countedQuantity, reason } = req.body;
    const [stock] = await Stock.findOrCreate({ where: { productId, locationId }, defaults: { quantity: 0 } });
    const diff = parseFloat(countedQuantity) - parseFloat(stock.quantity);
    stock.quantity = parseFloat(countedQuantity);
    await stock.save();
    const adj = await Adjustment.create({ reason });
    await Ledger.create({ type: 'adjustment', refId: adj.id, productId, fromLocationId: null, toLocationId: locationId, quantity: diff });
    res.json({ adj, stock });
}

async function getMoveHistory(req, res) {
    const ledger = await Ledger.findAll({ order: [['createdAt', 'DESC']], limit: 200 });
    res.json(ledger);
}

async function getLocations(req, res) {
    const locations = await StockLocation.findAll();
    res.json(locations);
}

async function createLocation(req, res) {
    const { name, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const location = await StockLocation.create({ name, address });
    res.json(location);
}

module.exports = { createReceipt, createDelivery, createTransfer, createAdjustment, getMoveHistory, getLocations, createLocation };