import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Package, 
    Search, 
    Plus, 
    X, 
    Filter, 
    Loader2, 
    MoreVertical, 
    AlertCircle,
    Grid3x3,
    List,
    Sparkles,
    TrendingUp,
    AlertTriangle,
    Layers,
    Hash,
    Tag,
    Box
} from 'lucide-react';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
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

    const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
    
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryColor = (category) => {
        const colors = {
            'Electronics': 'from-blue-500/20 to-cyan-500/20',
            'Raw Materials': 'from-amber-500/20 to-orange-500/20',
            'Furniture': 'from-purple-500/20 to-pink-500/20',
            'Textiles': 'from-emerald-500/20 to-teal-500/20',
            'default': 'from-indigo-500/20 to-purple-500/20'
        };
        return colors[category] || colors.default;
    };

    const ProductCard = ({ product, index }) => {
        const [isHovered, setIsHovered] = useState(false);
        const isLowStock = false; // Can be enhanced with actual stock data
        
        return (
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05, type: "spring", stiffness: 100 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="relative group cursor-pointer"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${getCategoryColor(product.category)} border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-3xl group-hover:border-white/20 p-6`}>
                    {/* Animated background gradient */}
                    <motion.div
                        className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100"
                        animate={isHovered ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                        transition={{ duration: 0.6 }}
                    />
                    
                    {/* Sparkle effect */}
                    <motion.div
                        className="absolute top-4 right-4"
                        animate={{ 
                            rotate: [0, 360],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Sparkles className="w-5 h-5 text-indigo-400 opacity-60" />
                    </motion.div>

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Package className="w-7 h-7 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg mb-1 group-hover:text-indigo-300 transition-colors">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-xs font-mono text-slate-400">{product.sku}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Category Badge */}
                        <div className="mb-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-slate-300 backdrop-blur-sm`}>
                                <Tag className="w-3.5 h-3.5" />
                                {product.category || 'Uncategorized'}
                            </span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <Box className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs text-slate-400 uppercase font-semibold">UOM</span>
                                </div>
                                <p className="text-sm font-bold text-white">{product.uom.toUpperCase()}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs text-slate-400 uppercase font-semibold">Reorder</span>
                                </div>
                                <p className="text-sm font-bold text-white">{product.reorder_level}</p>
                            </div>
                        </div>

                        {/* Status Indicator */}
                        {isLowStock && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-medium text-amber-300">Low Stock</span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    const ProductRow = ({ product, index }) => (
        <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            className="hover:bg-white/5 transition-colors group border-b border-white/5"
        >
            <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <div className="font-bold text-white text-base mb-1">{product.name}</div>
                        <div className="flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs font-mono text-slate-500">{product.sku}</span>
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-slate-300`}>
                    <Tag className="w-3.5 h-3.5" />
                    {product.category || 'Uncategorized'}
                </span>
            </td>
            <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-300 uppercase">{product.uom}</span>
                </div>
            </td>
            <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-white">{product.reorder_level}</span>
                    <span className="text-xs text-slate-500">units</span>
                </div>
            </td>
            <td className="px-6 py-5 text-right">
                <button className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </td>
        </motion.tr>
    );

    return (
        <Layout>
            <div className="space-y-8 pb-8">
                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-2xl border border-white/10 p-8 shadow-2xl"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.3),transparent_50%)] opacity-50" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30">
                                    <Package className="w-8 h-8 text-indigo-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                        Products
                                    </h1>
                                    <p className="text-slate-400 mt-1">Manage your inventory items</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                                <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                                    <span className="text-sm text-slate-300">
                                        <span className="font-bold text-white">{filteredProducts.length}</span> products
                                    </span>
                                </div>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsModalOpen(true)}
                            className="relative overflow-hidden px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 flex items-center gap-2 group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <Plus className="w-5 h-5 relative z-10" />
                            <span className="relative z-10">Add Product</span>
                        </motion.button>
                    </div>
                </motion.div>

                {/* Search, Filter, and View Toggle */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl" />
                        <div className="relative flex items-center gap-4 p-4">
                            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search products by name, SKU, or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-300 ${
                                    selectedCategory === cat
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {cat === 'all' ? 'All Categories' : cat}
                            </button>
                        ))}
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Grid3x3 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${
                                viewMode === 'list'
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Products Display */}
                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full"
                        />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-2xl border border-white/10 p-12 text-center shadow-2xl"
                    >
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
                            <Package className="w-12 h-12 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
                        <p className="text-slate-400 mb-6">Try adjusting your search or filters</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
                        >
                            <Plus className="w-5 h-5 inline mr-2" />
                            Create First Product
                        </button>
                    </motion.div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">UOM</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Reorder Level</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product, index) => (
                                        <ProductRow key={product.id} product={product} index={index} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
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
                            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-2xl rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="relative px-8 py-6 border-b border-white/10 bg-gradient-to-r from-indigo-600/20 to-purple-600/20">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.2),transparent_70%)]" />
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/40 flex items-center justify-center">
                                            <Plus className="w-6 h-6 text-indigo-300" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                                Add New Product
                                            </h2>
                                            <p className="text-sm text-slate-400 mt-1">Create a new inventory item</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsModalOpen(false)} 
                                        className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleCreateProduct} className="p-8 space-y-6">
                                {/* Product Name & SKU */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                            <Package className="w-4 h-4 text-indigo-400" />
                                            Product Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                            placeholder="e.g. Wireless Mouse"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                            <Hash className="w-4 h-4 text-indigo-400" />
                                            SKU
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={newProduct.sku}
                                            onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono"
                                            placeholder="e.g. WM-001"
                                        />
                                    </div>
                                </div>

                                {/* Category & UOM */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-indigo-400" />
                                            Category
                                        </label>
                                        <input
                                            type="text"
                                            value={newProduct.category}
                                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                            placeholder="e.g. Electronics"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                            <Box className="w-4 h-4 text-indigo-400" />
                                            Unit of Measure
                                        </label>
                                        <select
                                            value={newProduct.uom}
                                            onChange={(e) => setNewProduct({ ...newProduct, uom: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzk0YTNiZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right-4"
                                        >
                                            <option value="pcs" className="bg-slate-800">Pieces (pcs)</option>
                                            <option value="kg" className="bg-slate-800">Kilograms (kg)</option>
                                            <option value="l" className="bg-slate-800">Liters (l)</option>
                                            <option value="box" className="bg-slate-800">Box</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Reorder Level */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                                        Reorder Level
                                    </label>
                                    <input
                                        type="number"
                                        value={newProduct.reorder_level}
                                        onChange={(e) => setNewProduct({ ...newProduct, reorder_level: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                        placeholder="10"
                                    />
                                </div>

                                {/* Initial Stock Section */}
                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex items-center gap-2 mb-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                        <AlertCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                                        <p className="text-sm font-medium text-indigo-300">Optional: Add initial stock quantity</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-indigo-400" />
                                                Initial Quantity
                                            </label>
                                            <input
                                                type="number"
                                                value={newProduct.initialStock}
                                                onChange={(e) => setNewProduct({ ...newProduct, initialStock: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                                <Package className="w-4 h-4 text-indigo-400" />
                                                Location
                                            </label>
                                            <select
                                                value={newProduct.locationId}
                                                onChange={(e) => setNewProduct({ ...newProduct, locationId: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzk0YTNiZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={!newProduct.initialStock}
                                                required={!!newProduct.initialStock}
                                            >
                                                <option value="" className="bg-slate-800">Select Location</option>
                                                {locations.map(loc => (
                                                    <option key={loc.id} value={loc.id} className="bg-slate-800">{loc.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all font-semibold"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                                        whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                                        className="relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                                        <div className="relative flex items-center gap-2">
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-5 h-5" />
                                                    Create Product
                                                </>
                                            )}
                                        </div>
                                    </motion.button>
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
