import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search, Plus, X, Filter, Loader2, MoreVertical, AlertCircle } from 'lucide-react';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newProduct, setNewProduct] = useState({
        name: '',
        sku: '',
        category: '',
        uom: 'pcs',
        initialStock: '',
        locationId: '',
        reorder_level: 10
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, locationsRes] = await Promise.all([
                api.get('/products'),
                api.get('/ops/locations')
            ]);
            setProducts(productsRes.data);
            setLocations(locationsRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/products', newProduct);
            setIsModalOpen(false);
            setNewProduct({
                name: '',
                sku: '',
                category: '',
                uom: 'pcs',
                initialStock: '',
                locationId: '',
                reorder_level: 10
            });
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Failed to create product", error);
            alert(error.response?.data?.error || 'Failed to create product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="page-title">Products</h1>
                        <p className="page-subtitle">Manage your inventory items</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                    >
                        <Plus className="w-5 h-5" />
                        Add Product
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="flex items-center gap-4 glass-card p-2 rounded-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products by name, SKU, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 pl-12 py-3"
                        />
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <button className="p-3 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors mx-2">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                {/* Product List */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-950/30 text-slate-400 uppercase text-xs font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">SKU</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">UOM</th>
                                    <th className="px-6 py-4">Reorder Level</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-500" />
                                            Loading products...
                                        </td>
                                    </tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Package className="w-8 h-8 text-slate-600" />
                                            </div>
                                            No products found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors">
                                                        <Package className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{product.name}</div>
                                                        {/* Placeholder for stock status if available in future */}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 font-mono text-xs">{product.sku}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-full bg-slate-800/50 text-xs border border-slate-700 text-slate-300">
                                                    {product.category || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 uppercase text-xs font-bold tracking-wider">{product.uom}</td>
                                            <td className="px-6 py-4 text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{product.reorder_level}</span>
                                                    <span className="text-xs text-slate-600">units</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Product Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg glass-card overflow-hidden shadow-2xl"
                        >
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <h2 className="text-lg font-bold text-white">Add New Product</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateProduct} className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Product Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                            className="input-field"
                                            placeholder="e.g. Wireless Mouse"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">SKU</label>
                                        <input
                                            type="text"
                                            required
                                            value={newProduct.sku}
                                            onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                                            className="input-field font-mono"
                                            placeholder="e.g. WM-001"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Category</label>
                                        <input
                                            type="text"
                                            value={newProduct.category}
                                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                            className="input-field"
                                            placeholder="e.g. Electronics"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">UOM</label>
                                        <select
                                            value={newProduct.uom}
                                            onChange={(e) => setNewProduct({ ...newProduct, uom: e.target.value })}
                                            className="input-field appearance-none bg-no-repeat bg-right"
                                        >
                                            <option value="pcs">Pieces (pcs)</option>
                                            <option value="kg">Kilograms (kg)</option>
                                            <option value="l">Liters (l)</option>
                                            <option value="box">Box</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Reorder Level</label>
                                    <input
                                        type="number"
                                        value={newProduct.reorder_level}
                                        onChange={(e) => setNewProduct({ ...newProduct, reorder_level: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div className="pt-5 border-t border-white/10 mt-2">
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertCircle className="w-4 h-4 text-indigo-400" />
                                        <p className="text-xs font-medium text-indigo-300">Optional: Add initial stock</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-400">Initial Quantity</label>
                                            <input
                                                type="number"
                                                value={newProduct.initialStock}
                                                onChange={(e) => setNewProduct({ ...newProduct, initialStock: e.target.value })}
                                                className="input-field"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-400">Location</label>
                                            <select
                                                value={newProduct.locationId}
                                                onChange={(e) => setNewProduct({ ...newProduct, locationId: e.target.value })}
                                                className="input-field"
                                                disabled={!newProduct.initialStock}
                                                required={!!newProduct.initialStock}
                                            >
                                                <option value="">Select Location</option>
                                                {locations.map(loc => (
                                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-primary"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Creating...
                                            </div>
                                        ) : 'Create Product'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout>
    );
};

export default Products;
