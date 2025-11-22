const axios = require('axios');

// Configuration
const API_BASE = 'http://localhost:4000/api';
let authToken = '';

// Sample data
const sampleUser = {
    name: 'Demo User',
    email: 'demo@stockmaster.com',
    password: 'demo123',
    role: 'warehouse_staff'
};

const sampleProducts = [
    { name: 'Steel Rods', sku: 'STL-001', category: 'Raw Materials', uom: 'kg', reorderLevel: 100 },
    { name: 'Wooden Planks', sku: 'WD-002', category: 'Raw Materials', uom: 'pcs', reorderLevel: 50 },
    { name: 'Office Chair', sku: 'FUR-003', category: 'Furniture', uom: 'pcs', reorderLevel: 10 },
    { name: 'Laptop Dell XPS', sku: 'ELEC-004', category: 'Electronics', uom: 'pcs', reorderLevel: 5 },
    { name: 'Cotton Fabric', sku: 'TEX-005', category: 'Textiles', uom: 'm', reorderLevel: 200 },
    { name: 'Paint Buckets', sku: 'CHM-006', category: 'Chemicals', uom: 'L', reorderLevel: 30 },
    { name: 'Screws Set', sku: 'HW-007', category: 'Hardware', uom: 'box', reorderLevel: 25 },
    { name: 'LED Bulbs', sku: 'ELEC-008', category: 'Electronics', uom: 'pcs', reorderLevel: 50 },
];

const sampleLocations = [
    { name: 'Main Warehouse', type: 'warehouse' },
    { name: 'Production Floor', type: 'warehouse' },
    { name: 'Rack A1', type: 'location' },
    { name: 'Rack B2', type: 'location' },
];

async function seedData() {
    try {
        console.log('🌱 Starting StockMaster seed data...\n');

        // 1. Register user
        console.log('1️⃣  Creating demo user...');
        try {
            const signupRes = await axios.post(`${API_BASE}/auth/signup`, sampleUser);
            console.log('✅ User created:', signupRes.data.email);
        } catch (err) {
            if (err.response?.data?.error?.includes('already exists')) {
                console.log('ℹ️  User already exists, logging in...');
            } else {
                throw err;
            }
        }

        // 2. Login
        const loginRes = await axios.post(`${API_BASE}/auth/login`, {
            email: sampleUser.email,
            password: sampleUser.password
        });
        authToken = loginRes.data.token;
        console.log('✅ Logged in successfully\n');

        const headers = { Authorization: `Bearer ${authToken}` };

        // 3. Create locations
        console.log('2️⃣  Creating locations...');
        const createdLocations = [];
        for (const loc of sampleLocations) {
            try {
                const res = await axios.post(`${API_BASE}/ops/locations`, loc, { headers });
                createdLocations.push(res.data);
                console.log(`✅ Created location: ${loc.name}`);
            } catch (err) {
                console.log(`⚠️  Location ${loc.name} might already exist`);
            }
        }

        // Fetch all locations to get IDs
        const locsRes = await axios.get(`${API_BASE}/ops/locations`, { headers });
        const locations = locsRes.data;
        console.log(`\n3️⃣  Total locations available: ${locations.length}`);

        // 4. Create products
        console.log('\n4️⃣  Creating products...');
        const createdProducts = [];
        for (const prod of sampleProducts) {
            try {
                const res = await axios.post(`${API_BASE}/products`, prod, { headers });
                createdProducts.push(res.data);
                console.log(`✅ Created product: ${prod.name} (${prod.sku})`);
            } catch (err) {
                console.log(`⚠️  Product ${prod.name} might already exist`);
            }
        }

        // Fetch all products to get IDs
        const prodsRes = await axios.get(`${API_BASE}/products`, { headers });
        const products = prodsRes.data;
        console.log(`\n5️⃣  Total products available: ${products.length}`);

        // 5. Create sample receipts (incoming stock)
        console.log('\n6️⃣  Creating sample receipts...');
        if (products.length > 0 && locations.length > 0) {
            const receipt1 = {
                supplier: 'Global Steel Supplies',
                items: [
                    { productId: products[0].id, quantity: 500, locationId: locations[0].id },
                    { productId: products[1].id, quantity: 100, locationId: locations[0].id },
                ]
            };
            await axios.post(`${API_BASE}/ops/receipts`, receipt1, { headers });
            console.log('✅ Receipt 1: Steel & Wood received');

            const receipt2 = {
                supplier: 'Tech Distributors Inc',
                items: [
                    { productId: products[3].id, quantity: 15, locationId: locations[2].id },
                    { productId: products[7].id, quantity: 100, locationId: locations[2].id },
                ]
            };
            await axios.post(`${API_BASE}/ops/receipts`, receipt2, { headers });
            console.log('✅ Receipt 2: Electronics received');
        }

        // 6. Create sample deliveries (outgoing stock)
        console.log('\n7️⃣  Creating sample deliveries...');
        if (products.length > 0 && locations.length > 0) {
            const delivery1 = {
                customer: 'ABC Construction Co.',
                items: [
                    { productId: products[0].id, quantity: 50, locationId: locations[0].id },
                ]
            };
            await axios.post(`${API_BASE}/ops/deliveries`, delivery1, { headers });
            console.log('✅ Delivery 1: Steel shipped to ABC Construction');

            const delivery2 = {
                customer: 'XYZ Office Solutions',
                items: [
                    { productId: products[2].id, quantity: 5, locationId: locations[0].id },
                ]
            };
            await axios.post(`${API_BASE}/ops/deliveries`, delivery2, { headers });
            console.log('✅ Delivery 2: Chairs shipped to XYZ Office');
        }

        // 7. Create sample transfers
        console.log('\n8️⃣  Creating sample transfers...');
        if (products.length > 0 && locations.length >= 2) {
            const transfer1 = {
                items: [
                    { productId: products[1].id, quantity: 20, fromLocationId: locations[0].id, toLocationId: locations[1].id },
                ]
            };
            await axios.post(`${API_BASE}/ops/transfers`, transfer1, { headers });
            console.log('✅ Transfer 1: Wood moved to Production Floor');
        }

        console.log('\n✅ ✅ ✅  SEED DATA COMPLETE! ✅ ✅ ✅');
        console.log('\n📊 Summary:');
        console.log(`   - Products: ${products.length}`);
        console.log(`   - Locations: ${locations.length}`);
        console.log(`   - Receipts: 2`);
        console.log(`   - Deliveries: 2`);
        console.log(`   - Transfers: 1`);
        console.log('\n🔐 Login credentials:');
        console.log(`   Email: ${sampleUser.email}`);
        console.log(`   Password: ${sampleUser.password}`);
        console.log('\n🚀 You can now login and explore the application!');

    } catch (error) {
        console.error('\n❌ Error seeding data:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Run the seed script
seedData();
