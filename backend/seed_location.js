const sequelize = require('./config/db');
const StockLocation = require('./models/StockLocation');

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('DB connected');

        const loc = await StockLocation.findOne({ where: { name: 'Warehouse A' } });
        if (!loc) {
            await StockLocation.create({ name: 'Warehouse A', description: 'Main Warehouse' });
            console.log('Created Warehouse A');
        } else {
            console.log('Warehouse A already exists');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
