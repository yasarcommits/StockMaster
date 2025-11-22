import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Package, Search, Plus, X, Filter, Loader2, MoreVertical, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const Products = () => {
    const { isDark } = useTheme();
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
            fetchData();
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
                <div className={clsx(
                    "flex items-center gap-4 p-2 rounded-2xl",
                    isDark ? "glass-card" : "bg-white border border-slate-200 shadow-md"
                )}>
                    <div className="relative flex-1">
                        <Search className={clsx(
                            "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5",
                            isDark ? "text-slate-500" : "text-slate-400"
                        )} />
                        <input
                            type="text"
                            placeholder="Search products by name, SKU, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={clsx(
                                "w-full border-none focus:ring-0 pl-12 py-3",
                                isDark 
                                    ? "bg-transparent text-white placeholder-slate-500"
                                    : "bg-transparent text-slate-900 placeholder-slate-400"
                            )}
                        />
                    </div>
                    <div className={clsx(
                        "h-8 w-px",
                        isDark ? "bg-white/10" : "bg-slate-200"
                    )} />
                    <button className={clsx(
                        "p-3 rounded-xl transition-colors mx-2",
                        isDark 
                            ? "hover:bg-white/5 text-slate-400 hover:text-white"
                            : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                    )}>
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                {/* Product List */}
                <div className={clsx(
                    "overflow-hidden",
                    isDark ? "glass-card" : "bg-white rounded-2xl border border-slate-200 shadow-lg"
                )}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className={clsx(
                                "uppercase text-xs font-semibold tracking-wider",
                                isDark ? "bg-slate-950/30 text-slate-400" : "bg-slate-50 text-slate-700"
                            )}>
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">SKU</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">UOM</th>
                                    <th className="px-6 py-4">Reorder Level</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={clsx(
                                "divide-y",
                                isDark ? "divide-white/5" : "divide-slate-100"
                            )}>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-500" />
                                            Loading products...
                                        </td>
                                    </tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className={clsx(
                                            "px-6 py-12 text-center",
                                            isDark ? "text-slate-500" : "text-slate-600"
                                        )}>
                                            <div className={clsx(
                                                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                                                isDark ? "bg-slate-800/50" : "bg-slate-100"
                                            )}>
                                                <Package className={clsx(
                                                    "w-8 h-8",
                                                    isDark ? "text-slate-600" : "text-slate-400"
                                                )} />
                                            </div>
                                            No products found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className={clsx(
                                            "transition-colors group",
                                            isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                                        )}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={clsx(
                                                        "w-10 h-10 rounded-lg flex items-center justify-center border transition-colors",
                                                        isDark 
                                                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 group-hover:border-indigo-500/40"
                                                            : "bg-indigo-100 text-indigo-600 border-indigo-200 group-hover:border-indigo-300"
                                                    )}>
                                                        <Package className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className={clsx(
                                                            "font-semibold",
                                                            isDark ? "text-white" : "text-slate-900"
                                                        )}>{product.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={clsx(
                                                "px-6 py-4 font-mono text-xs",
                                                isDark ? "text-slate-400" : "text-slate-600"
                                            )}>{product.sku}</td>
                                            <td className="px-6 py-4">
                                                <span className={clsx(
                                                    "px-2.5 py-1 rounded-full text-xs border",
                                                    isDark 
                                                        ? "bg-slate-800/50 border-slate-700 text-slate-300"
                                                        : "bg-slate-100 border-slate-200 text-slate-700"
                                                )}>
                                                    {product.category || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className={clsx(
                                                "px-6 py-4 uppercase text-xs font-bold tracking-wider",
                                                isDark ? "text-slate-400" : "text-slate-600"
                                            )}>{product.uom}</td>
                                            <td className={clsx(
                                                "px-6 py-4",
                                                isDark ? "text-slate-400" : "text-slate-600"
                                            )}>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{product.reorder_level}</span>
                                                    <span className={clsx(
                                                        "text-xs",
                                                        isDark ? "text-slate-600" : "text-slate-400"
                                                    )}>units</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className={clsx(
                                                    "p-2 rounded-lg transition-colors",
                                                    isDark 
                                                        ? "hover:bg-white/10 text-slate-500 hover:text-white"
                                                        : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                                                )}>
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
                            className={clsx(
                                "absolute inset-0 backdrop-blur-sm",
                                isDark ? "bg-slate-950/80" : "bg-slate-900/30"
                            )}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={clsx(
                                "relative w-full max-w-lg overflow-hidden shadow-2xl",
                                isDark ? "glass-card" : "bg-white rounded-2xl border border-slate-200"
                            )}
                        >
                            <div className={clsx(
                                "px-6 py-4 border-b flex items-center justify-between",
                                isDark 
                                    ? "border-white/10 bg-white/5"
                                    : "border-slate-200 bg-slate-50"
                            )}>
                                <h2 className={clsx(
                                    "text-lg font-bold",
                                    isDark ? "text-white" : "text-slate-900"
                                )}>Add New Product</h2>
                                <button 
                                    onClick={() => setIsModalOpen(false)} 
                                    className={clsx(
                                        "transition-colors",
                                        isDark 
                                            ? "text-slate-400 hover:text-white"
                                            : "text-slate-500 hover:text-slate-900"
                                    )}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateProduct} className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className={clsx(
                                            "text-sm font-medium",
                                            isDark ? "text-slate-400" : "text-slate-700"
                                        )}>Product Name</label>
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
                                        <label className={clsx(
                                            "text-sm font-medium",
                                            isDark ? "text-slate-400" : "text-slate-700"
                                        )}>SKU</label>
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
                                        <label className={clsx(
                                            "text-sm font-medium",
                                            isDark ? "text-slate-400" : "text-slate-700"
                                        )}>Category</label>
                                        <input
                                            type="text"
                                            value={newProduct.category}
                                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                            className="input-field"
                                            placeholder="e.g. Electronics"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={clsx(
                                            "text-sm font-medium",
                                            isDark ? "text-slate-400" : "text-slate-700"
                                        )}>UOM</label>
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
                                    <label className={clsx(
                                        "text-sm font-medium",
                                        isDark ? "text-slate-400" : "text-slate-700"
                                    )}>Reorder Level</label>
                                    <input
                                        type="number"
                                        value={newProduct.reorder_level}
                                        onChange={(e) => setNewProduct({ ...newProduct, reorder_level: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div className={clsx(
                                    "pt-5 border-t mt-2",
                                    isDark ? "border-white/10" : "border-slate-200"
                                )}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertCircle className={clsx(
                                            "w-4 h-4",
                                            isDark ? "text-indigo-400" : "text-indigo-600"
                                        )} />
                                        <p className={clsx(
                                            "text-xs font-medium",
                                            isDark ? "text-indigo-300" : "text-indigo-700"
                                        )}>Optional: Add initial stock</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className={clsx(
                                                "text-sm font-medium",
                                                isDark ? "text-slate-400" : "text-slate-700"
                                            )}>Initial Quantity</label>
                                            <input
                                                type="number"
                                                value={newProduct.initialStock}
                                                onChange={(e) => setNewProduct({ ...newProduct, initialStock: e.target.value })}
                                                className="input-field"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className={clsx(
                                                "text-sm font-medium",
                                                isDark ? "text-slate-400" : "text-slate-700"
                                            )}>Location</label>
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
                                        className={clsx(
                                            "px-4 py-2 rounded-xl font-medium transition-colors",
                                            isDark 
                                                ? "text-slate-400 hover:bg-white/5 hover:text-white"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        )}
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