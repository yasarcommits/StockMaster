import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { 
    BarChart3,
    TrendingUp,
    TrendingDown,
    PieChart,
    LineChart,
    Activity,
    DollarSign,
    Package,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    Filter,
    Download,
    Sparkles,
    Layers,
    Warehouse,
    AlertCircle
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    BarChart,
    Bar,
    LineChart as RechartsLineChart,
    Line,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    PieChart as RechartsPieChart,
    Pie,
    Cell as PieCell,
    Legend,
    ComposedChart
} from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#14b8a6'];
const PIE_COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#14b8a6', '#f97316', '#84cc16'];

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d');
    const [reportData, setReportData] = useState({
        sales: [],
        inventory: [],
        categories: [],
        trends: [],
        topProducts: [],
        stockValue: 0,
        totalMovements: 0,
        avgTurnover: 0
    });

    useEffect(() => {
        fetchReportData();
    }, [timeRange]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            // Fetch data from various endpoints
            const [productsRes, historyRes] = await Promise.all([
                api.get('/products'),
                api.get('/ops/history')
            ]);

            // Process data for reports
            const products = productsRes.data;
            const history = historyRes.data;

            // Calculate stock value
            const stockValue = products.reduce((sum, p) => sum + (p.stockValue || 0), 0);

            // Process category distribution - use product count per category
            const categoryData = products.reduce((acc, product) => {
                const cat = product.category || 'Uncategorized';
                if (!acc[cat]) {
                    acc[cat] = { name: cat, value: 0, count: 0 };
                }
                // Use count of products as the value for the pie chart
                acc[cat].count += 1;
                acc[cat].value = acc[cat].count; // Use count as value for visualization
                return acc;
            }, {});

            // Generate trend data (last 30 days)
            const trendData = generateTrendData(history);

            // Top products by movement
            const topProducts = getTopProducts(history, products);

            setReportData({
                sales: generateSalesData(),
                inventory: generateInventoryData(products),
                categories: Object.values(categoryData),
                trends: trendData,
                topProducts: topProducts.slice(0, 10),
                stockValue,
                totalMovements: history.length,
                avgTurnover: calculateAvgTurnover(history)
            });
        } catch (error) {
            console.error("Failed to fetch report data", error);
        } finally {
            setLoading(false);
        }
    };

    const generateTrendData = (history) => {
        const days = 30;
        const data = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayHistory = history.filter(h => {
                const hDate = new Date(h.createdAt).toISOString().split('T')[0];
                return hDate === dateStr;
            });

            data.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                receipts: dayHistory.filter(h => h.type === 'receipt').length,
                deliveries: dayHistory.filter(h => h.type === 'delivery').length,
                transfers: dayHistory.filter(h => h.type === 'transfer').length,
                total: dayHistory.length
            });
        }
        return data;
    };

    const getTopProducts = (history, products) => {
        const productCounts = {};
        history.forEach(h => {
            if (!productCounts[h.productId]) {
                productCounts[h.productId] = { id: h.productId, count: 0, quantity: 0 };
            }
            productCounts[h.productId].count += 1;
            productCounts[h.productId].quantity += Math.abs(h.quantity || 0);
        });

        return Object.values(productCounts)
            .map(p => {
                const product = products.find(pr => pr.id === p.id);
                return {
                    ...p,
                    name: product?.name || `Product #${p.id}`,
                    category: product?.category || 'Uncategorized'
                };
            })
            .sort((a, b) => b.count - a.count);
    };

    const generateSalesData = () => {
        return [
            { month: 'Jan', sales: 45000, orders: 120 },
            { month: 'Feb', sales: 52000, orders: 145 },
            { month: 'Mar', sales: 48000, orders: 130 },
            { month: 'Apr', sales: 61000, orders: 165 },
            { month: 'May', sales: 55000, orders: 150 },
            { month: 'Jun', sales: 67000, orders: 180 }
        ];
    };

    const generateInventoryData = (products) => {
        return products.slice(0, 8).map((p, i) => ({
            name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
            stock: Math.floor(Math.random() * 500) + 50,
            value: Math.floor(Math.random() * 10000) + 1000
        }));
    };

    const calculateAvgTurnover = (history) => {
        if (history.length === 0) return 0;
        const days = 30;
        return (history.length / days).toFixed(1);
    };

    const StatCard = ({ title, value, icon: Icon, color, gradient, delay, trend, trendValue, subtitle }) => {
        const [isHovered, setIsHovered] = useState(false);
        
        return (
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="relative group cursor-pointer"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-6 border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-3xl group-hover:border-white/20`}>
                    <motion.div
                        className={`absolute inset-0 ${color} opacity-0 group-hover:opacity-10`}
                        animate={isHovered ? { scale: 1.5, rotate: 45 } : { scale: 1, rotate: 0 }}
                        transition={{ duration: 0.6 }}
                    />
                    
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
                        <Sparkles className={`w-5 h-5 ${color.replace('bg-', 'text-')} opacity-60`} />
                    </motion.div>

                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-1">{title}</p>
                                <motion.h3 
                                    className="text-4xl font-bold text-white mb-2"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
                                >
                                    {typeof value === 'number' ? value.toLocaleString() : value}
                                </motion.h3>
                                {subtitle && (
                                    <p className="text-xs text-white/50 font-medium">{subtitle}</p>
                                )}
                                {trend && (
                                    <div className="flex items-center gap-1.5 mt-2">
                                        {trend === 'up' ? (
                                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-400" />
                                        )}
                                        <span className={`text-xs font-semibold ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {trendValue}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <motion.div
                                className={`p-4 rounded-2xl ${color} bg-opacity-20 backdrop-blur-sm border border-white/10 group-hover:bg-opacity-30 transition-all duration-300`}
                                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const ChartCard = ({ title, icon: Icon, children, delay, className = "" }) => (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, type: "spring" }}
            className={`relative rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-2xl border border-white/10 p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 ${className}`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                            <Icon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
                {children}
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full"
                    />
                </div>
            </Layout>
        );
    }

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
                                    <BarChart3 className="w-8 h-8 text-indigo-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                        Reports & Analytics
                                    </h1>
                                    <p className="text-slate-400 mt-1">Comprehensive insights and visualizations</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
                                {['7d', '30d', '90d', '1y'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                            timeRange === range
                                                ? 'bg-indigo-600 text-white shadow-lg'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                            <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                <Filter className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Stock Value"
                        value={`$${reportData.stockValue.toLocaleString()}`}
                        icon={DollarSign}
                        color="bg-emerald-500"
                        gradient="from-emerald-500/20 via-emerald-600/10 to-slate-900/90"
                        delay={0.1}
                        trend="up"
                        trendValue="+12%"
                        subtitle="Current inventory value"
                    />
                    <StatCard
                        title="Total Movements"
                        value={reportData.totalMovements}
                        icon={Activity}
                        color="bg-blue-500"
                        gradient="from-blue-500/20 via-blue-600/10 to-slate-900/90"
                        delay={0.2}
                        trend="up"
                        trendValue="+8%"
                        subtitle="All transactions"
                    />
                    <StatCard
                        title="Avg Daily Turnover"
                        value={reportData.avgTurnover}
                        icon={TrendingUp}
                        color="bg-purple-500"
                        gradient="from-purple-500/20 via-purple-600/10 to-slate-900/90"
                        delay={0.3}
                        subtitle="Movements per day"
                    />
                    <StatCard
                        title="Active Products"
                        value={reportData.categories.reduce((sum, cat) => sum + cat.count, 0)}
                        icon={Package}
                        color="bg-pink-500"
                        gradient="from-pink-500/20 via-pink-600/10 to-slate-900/90"
                        delay={0.4}
                        subtitle="In inventory"
                    />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Stock Flow Trend */}
                    <ChartCard title="Stock Movement Trends" icon={LineChart} delay={0.1}>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={reportData.trends}>
                                <defs>
                                    <linearGradient id="colorReceipts" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        color: '#fff'
                                    }} 
                                />
                                <Area type="monotone" dataKey="receipts" stackId="1" stroke="#10b981" fillOpacity={1} fill="url(#colorReceipts)" />
                                <Area type="monotone" dataKey="deliveries" stackId="1" stroke="#ef4444" fillOpacity={1} fill="url(#colorDeliveries)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Category Distribution */}
                    <ChartCard title="Category Distribution" icon={PieChart} delay={0.2}>
                        {reportData.categories.length === 0 ? (
                            <div className="flex items-center justify-center h-[300px] text-slate-400">
                                <div className="text-center">
                                    <PieChart className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                                    <p>No category data available</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsPieChart>
                                    <Pie
                                        data={reportData.categories}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => {
                                            if (percent < 0.05) return ''; // Hide labels for very small slices
                                            return `${name}: ${(percent * 100).toFixed(0)}%`;
                                        }}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {reportData.categories.map((entry, index) => (
                                            <PieCell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            color: '#fff'
                                        }}
                                        formatter={(value, name, props) => [
                                            `${value} products`,
                                            props.payload.name
                                        ]}
                                    />
                                    <Legend 
                                        wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }}
                                        iconType="circle"
                                    />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Products */}
                    <ChartCard title="Top Products by Activity" icon={Activity} delay={0.3}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={reportData.topProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} width={120} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        color: '#fff'
                                    }} 
                                />
                                <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Sales Performance */}
                    <ChartCard title="Sales Performance" icon={TrendingUp} delay={0.4}>
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={reportData.sales}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                                <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} />
                                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        color: '#fff'
                                    }} 
                                />
                                <Bar yAxisId="left" dataKey="sales" fill="#6366f1" radius={[8, 8, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#ec4899" strokeWidth={3} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                {/* Inventory Overview */}
                <ChartCard title="Inventory Overview" icon={Layers} delay={0.5} className="col-span-1">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={reportData.inventory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} angle={-45} textAnchor="end" height={100} />
                            <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} />
                            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    color: '#fff'
                                }} 
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="stock" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Stock Quantity" />
                            <Bar yAxisId="right" dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} name="Value ($)" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </Layout>
    );
};

export default Reports;

