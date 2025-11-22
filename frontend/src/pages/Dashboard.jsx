import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
    Package, 
    Layers, 
    ArrowDownLeft, 
    ArrowUpRight, 
    AlertTriangle, 
    TrendingUp, 
    TrendingDown,
    Clock,
    Sparkles,
    PieChart
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    PieChart as RechartsPieChart,
    Pie,
    Cell as PieCell,
    Legend
} from 'recharts';
import clsx from 'clsx';

const StatCard = ({ title, value, icon: Icon, color, gradient, delay, trend, trendValue, subtitle }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { isDark } = useTheme();
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative group cursor-pointer"
        >
            <div className={clsx(
                "absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                isDark ? "bg-gradient-to-br from-white/5 to-transparent" : "bg-gradient-to-br from-indigo-200/30 to-transparent"
            )} />
            <div className={clsx(
                "relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-3xl",
                isDark 
                    ? `bg-gradient-to-br ${gradient} border border-white/10 group-hover:border-white/20`
                    : "bg-white border border-slate-200 group-hover:border-indigo-300 shadow-lg"
            )}>
                {/* Animated background gradient */}
                <motion.div
                    className={clsx(
                        "absolute inset-0 opacity-0 group-hover:opacity-10",
                        isDark ? color : "bg-indigo-500"
                    )}
                    animate={isHovered ? { scale: 1.5, rotate: 45 } : { scale: 1, rotate: 0 }}
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
                    <Sparkles className={clsx(
                        "w-5 h-5 opacity-60",
                        isDark ? color.replace('bg-', 'text-') : "text-indigo-500"
                    )} />
                </motion.div>

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <p className={clsx(
                                "text-sm font-semibold uppercase tracking-wider mb-1",
                                isDark ? "text-white/70" : "text-slate-600"
                            )}>{title}</p>
                            <motion.h3 
                                className={clsx(
                                    "text-4xl font-bold mb-2",
                                    isDark ? "text-white" : "text-slate-900"
                                )}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
                            >
                                {typeof value === 'number' ? value.toLocaleString() : value}
                            </motion.h3>
                            {subtitle && (
                                <p className={clsx(
                                    "text-xs font-medium",
                                    isDark ? "text-white/50" : "text-slate-500"
                                )}>{subtitle}</p>
                            )}
                            {trend && (
                                <div className="flex items-center gap-1.5 mt-2">
                                    {trend === 'up' ? (
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                    )}
                                    <span className={clsx(
                                        "text-xs font-semibold",
                                        trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                                    )}>
                                        {trendValue}
                                    </span>
                                </div>
                            )}
                        </div>
                        <motion.div
                            className={clsx(
                                "p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300",
                                isDark 
                                    ? `${color} bg-opacity-20 border-white/10 group-hover:bg-opacity-30`
                                    : "bg-indigo-100 border-indigo-200 group-hover:bg-indigo-200"
                            )}
                            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Icon className={clsx(
                                "w-7 h-7",
                                isDark ? color.replace('bg-', 'text-') : "text-indigo-600"
                            )} />
                        </motion.div>
                    </div>
                </div>

                {/* Shine effect on hover */}
                <motion.div
                    className={clsx(
                        "absolute inset-0 bg-gradient-to-r from-transparent to-transparent",
                        isDark ? "via-white/10" : "via-indigo-200/50"
                    )}
                    initial={{ x: '-100%' }}
                    animate={isHovered ? { x: '100%' } : { x: '-100%' }}
                    transition={{ duration: 0.6 }}
                />
            </div>
        </motion.div>
    );
};

const ChartCard = ({ title, icon: Icon, children, delay, className = "" }) => {
    const { isDark } = useTheme();
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, type: "spring" }}
            className={clsx(
                "relative rounded-3xl backdrop-blur-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500",
                isDark 
                    ? "bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-white/10"
                    : "bg-white border border-slate-200",
                className
            )}
        >
            <div className={clsx(
                "absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500",
                isDark ? "bg-gradient-to-br from-indigo-500/5 to-purple-500/5" : "bg-gradient-to-br from-indigo-50 to-purple-50"
            )} />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            "p-2.5 rounded-xl border",
                            isDark 
                                ? "bg-indigo-500/10 border-indigo-500/20"
                                : "bg-indigo-100 border-indigo-200"
                        )}>
                            <Icon className={clsx(
                                "w-5 h-5",
                                isDark ? "text-indigo-400" : "text-indigo-600"
                            )} />
                        </div>
                        <h3 className={clsx(
                            "text-xl font-bold",
                            isDark ? "text-white" : "text-slate-900"
                        )}>{title}</h3>
                    </div>
                </div>
                {children}
            </div>
        </motion.div>
    );
};

const Dashboard = () => {
    const { isDark } = useTheme();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalStock: 0,
        pendingReceipts: 0,
        pendingDeliveries: 0,
        lowStockProducts: []
    });
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState({
        stockTrends: [],
        categoryData: []
    });
    const [timeRange, setTimeRange] = useState('7d');

    const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4'];
    const PIE_COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#14b8a6'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [kpiRes, chartRes] = await Promise.all([
                    api.get('/dashboard/kpis'),
                    api.get('/dashboard/charts')
                ]);
                setStats(kpiRes.data);
                setChartData(chartRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getTimeOfDayEmoji = () => {
        const hour = new Date().getHours();
        if (hour < 12) return '🌅';
        if (hour < 18) return '☀️';
        return '🌙';
    };

    const formattedStockTrends = chartData.stockTrends?.length > 0 
        ? chartData.stockTrends.map(item => ({
            ...item,
            name: new Date(item.name).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }))
        : [
            { name: 'Mon', in: 120, out: 80 },
            { name: 'Tue', in: 150, out: 90 },
            { name: 'Wed', in: 180, out: 100 },
            { name: 'Thu', in: 200, out: 110 },
            { name: 'Fri', in: 170, out: 95 },
            { name: 'Sat', in: 140, out: 85 },
            { name: 'Sun', in: 160, out: 100 }
        ];

    const formattedCategoryData = chartData.categoryData?.length > 0 
        ? chartData.categoryData 
        : [
            { name: 'Electronics', value: 45 },
            { name: 'Raw Materials', value: 32 },
            { name: 'Furniture', value: 18 },
            { name: 'Textiles', value: 15 }
        ];

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
                {/* Hero Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className={clsx(
                        "relative overflow-hidden rounded-3xl backdrop-blur-2xl border p-8 shadow-2xl",
                        isDark 
                            ? "bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 border-white/10"
                            : "bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 border-indigo-200"
                    )}
                >
                    <div className={clsx(
                        "absolute inset-0 opacity-50",
                        isDark 
                            ? "bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.3),transparent_50%)]"
                            : "bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_50%)]"
                    )} />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <motion.span
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    className="text-4xl"
                                >
                                    {getTimeOfDayEmoji()}
                                </motion.span>
                                <h1 className={clsx(
                                    "text-4xl md:text-5xl font-bold",
                                    isDark 
                                        ? "bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent"
                                        : "text-slate-900"
                                )}>
                                    {getGreeting()}!
                                </h1>
                            </div>
                            <p className={clsx(
                                "text-lg font-medium",
                                isDark ? "text-white/80" : "text-slate-700"
                            )}>
                                Here's your inventory overview at a glance
                            </p>
                            <div className="flex items-center gap-4 mt-4">
                                <div className={clsx(
                                    "flex items-center gap-2 px-4 py-2 rounded-full border",
                                    isDark 
                                        ? "bg-emerald-500/10 border-emerald-500/20"
                                        : "bg-emerald-100 border-emerald-300"
                                )}>
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="w-2 h-2 rounded-full bg-emerald-500"
                                    />
                                    <span className={clsx(
                                        "text-sm font-semibold",
                                        isDark ? "text-emerald-400" : "text-emerald-700"
                                    )}>All Systems Operational</span>
                                </div>
                                <div className={clsx(
                                    "text-sm",
                                    isDark ? "text-white/60" : "text-slate-600"
                                )}>
                                    Last updated: {new Date().toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={clsx(
                                "hidden md:flex items-center gap-2 px-6 py-3 rounded-2xl border backdrop-blur-sm",
                                isDark 
                                    ? "bg-white/5 border-white/10"
                                    : "bg-white border-indigo-200 shadow-md"
                            )}
                        >
                            <Clock className={clsx(
                                "w-5 h-5",
                                isDark ? "text-indigo-400" : "text-indigo-600"
                            )} />
                            <div className="text-right">
                                <div className={clsx(
                                    "text-xs",
                                    isDark ? "text-white/60" : "text-slate-600"
                                )}>Current Time</div>
                                <div className={clsx(
                                    "text-lg font-bold",
                                    isDark ? "text-white" : "text-slate-900"
                                )}>{new Date().toLocaleTimeString()}</div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Products"
                        value={stats.totalProducts || 0}
                        icon={Package}
                        color="bg-blue-500"
                        gradient="from-blue-500/20 via-blue-600/10 to-slate-900/90"
                        delay={0.1}
                        trend="up"
                        trendValue="+12%"
                        subtitle="Active items"
                    />
                    <StatCard
                        title="Total Stock"
                        value={stats.totalStock || 0}
                        icon={Layers}
                        color="bg-purple-500"
                        gradient="from-purple-500/20 via-purple-600/10 to-slate-900/90"
                        delay={0.2}
                        trend="up"
                        trendValue="+8%"
                        subtitle="Units available"
                    />
                    <StatCard
                        title="Pending Receipts"
                        value={stats.pendingReceipts || 0}
                        icon={ArrowDownLeft}
                        color="bg-emerald-500"
                        gradient="from-emerald-500/20 via-emerald-600/10 to-slate-900/90"
                        delay={0.3}
                        subtitle="Awaiting processing"
                    />
                    <StatCard
                        title="Pending Deliveries"
                        value={stats.pendingDeliveries || 0}
                        icon={ArrowUpRight}
                        color="bg-orange-500"
                        gradient="from-orange-500/20 via-orange-600/10 to-slate-900/90"
                        delay={0.4}
                        subtitle="Ready to ship"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <ChartCard
                        title="Stock Flow Trends"
                        icon={TrendingUp}
                        delay={0.5}
                        className="lg:col-span-2"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <p className={clsx(
                                "text-sm",
                                isDark ? "text-white/60" : "text-slate-600"
                            )}>Incoming vs Outgoing stock</p>
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className={clsx(
                                    "border text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500/50 transition-colors",
                                    isDark 
                                        ? "bg-slate-800/50 border-white/10 text-white/80"
                                        : "bg-slate-50 border-slate-300 text-slate-700"
                                )}
                            >
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                            </select>
                        </div>
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={formattedStockTrends}>
                                    <defs>
                                        <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="50%" stopColor="#6366f1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                                            <stop offset="50%" stopColor="#ec4899" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid 
                                        strokeDasharray="3 3" 
                                        stroke={isDark ? "#334155" : "#e2e8f0"} 
                                        vertical={false} 
                                    />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke={isDark ? "#94a3b8" : "#64748b"} 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
                                    />
                                    <YAxis 
                                        stroke={isDark ? "#94a3b8" : "#64748b"} 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ 
                                            backgroundColor: isDark ? '#1e293b' : '#ffffff', 
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, 
                                            borderRadius: '12px', 
                                            color: isDark ? '#f8fafc' : '#1e293b',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                                        }}
                                        itemStyle={{ color: isDark ? '#f8fafc' : '#1e293b' }}
                                        labelStyle={{ color: isDark ? '#94a3b8' : '#64748b', marginBottom: '8px' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="in" 
                                        stroke="#6366f1" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorIn)" 
                                        name="Stock In"
                                        dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="out" 
                                        stroke="#ec4899" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorOut)" 
                                        name="Stock Out"
                                        dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    <ChartCard
                        title="Category Distribution"
                        icon={PieChart}
                        delay={0.6}
                    >
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={formattedCategoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={800}
                                    >
                                        {formattedCategoryData.map((entry, index) => (
                                            <PieCell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ 
                                            backgroundColor: isDark ? '#1e293b' : '#ffffff', 
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, 
                                            borderRadius: '12px',
                                            color: isDark ? '#f8fafc' : '#1e293b'
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}
                                        iconType="circle"
                                    />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                {/* Low Stock Alerts */}
                {stats.lowStockProducts && stats.lowStockProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className={clsx(
                            "relative rounded-3xl backdrop-blur-2xl border overflow-hidden shadow-2xl",
                            isDark 
                                ? "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-900/90 border-amber-500/20"
                                : "bg-white border-amber-200"
                        )}
                    >
                        <div className={clsx(
                            "absolute inset-0",
                            isDark 
                                ? "bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.1),transparent_50%)]"
                                : "bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.05),transparent_50%)]"
                        )} />
                        <div className="relative z-10">
                            <div className={clsx(
                                "p-6 border-b flex items-center gap-4",
                                isDark 
                                    ? "border-amber-500/20 bg-amber-500/5"
                                    : "border-amber-200 bg-amber-50"
                            )}>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className={clsx(
                                        "p-3 rounded-xl border",
                                        isDark 
                                            ? "bg-amber-500/20 border-amber-500/30"
                                            : "bg-amber-100 border-amber-300"
                                    )}
                                >
                                    <AlertTriangle className={clsx(
                                        "w-6 h-6",
                                        isDark ? "text-amber-400" : "text-amber-600"
                                    )} />
                                </motion.div>
                                <div>
                                    <h2 className={clsx(
                                        "text-xl font-bold",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>Low Stock Alerts</h2>
                                    <p className={clsx(
                                        "text-sm",
                                        isDark ? "text-white/60" : "text-slate-600"
                                    )}>Products below reorder level - Action required</p>
                                </div>
                                <div className={clsx(
                                    "ml-auto px-4 py-2 rounded-full border",
                                    isDark 
                                        ? "bg-amber-500/20 border-amber-500/30"
                                        : "bg-amber-100 border-amber-300"
                                )}>
                                    <span className={clsx(
                                        "text-sm font-bold",
                                        isDark ? "text-amber-400" : "text-amber-700"
                                    )}>{stats.lowStockProducts.length}</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className={clsx(
                                        "uppercase text-xs font-semibold tracking-wider",
                                        isDark ? "bg-slate-900/50 text-white/60" : "bg-slate-50 text-slate-600"
                                    )}>
                                        <tr>
                                            <th className="px-6 py-4">Product Name</th>
                                            <th className="px-6 py-4">SKU</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className={clsx(
                                        "divide-y",
                                        isDark ? "divide-white/5" : "divide-slate-200"
                                    )}>
                                        <AnimatePresence>
                                            {stats.lowStockProducts.slice(0, 5).map((product, index) => (
                                                <motion.tr
                                                    key={product.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.8 + index * 0.1 }}
                                                    className={clsx(
                                                        "transition-colors group",
                                                        isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                                                    )}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className={clsx(
                                                            "font-semibold",
                                                            isDark ? "text-white" : "text-slate-900"
                                                        )}>{product.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={clsx(
                                                            "font-mono text-sm px-2 py-1 rounded",
                                                            isDark 
                                                                ? "text-slate-400 bg-slate-800/50"
                                                                : "text-slate-700 bg-slate-100"
                                                        )}>
                                                            {product.sku}
                                                        </span>
                                                    </td>
                                                    <td className={clsx(
                                                        "px-6 py-4",
                                                        isDark ? "text-slate-400" : "text-slate-600"
                                                    )}>{product.category || 'N/A'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={clsx(
                                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                                                            isDark 
                                                                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                                                : "bg-amber-100 text-amber-700 border-amber-300"
                                                        )}>
                                                            <motion.span
                                                                animate={{ opacity: [1, 0.5, 1] }}
                                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                                className={clsx(
                                                                    "w-2 h-2 rounded-full",
                                                                    isDark ? "bg-amber-400" : "bg-amber-600"
                                                                )}
                                                            />
                                                            Low Stock
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => window.location.href = '/operations'}
                                                            className={clsx(
                                                                "text-sm font-semibold hover:underline transition-colors",
                                                                isDark 
                                                                    ? "text-indigo-400 hover:text-indigo-300"
                                                                    : "text-indigo-600 hover:text-indigo-700"
                                                            )}
                                                        >
                                                            Reorder →
                                                        </motion.button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {[
                        { icon: Package, label: 'Add Product', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20', href: '/products' },
                        { icon: ArrowDownLeft, label: 'New Receipt', color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20', href: '/operations' },
                        { icon: ArrowUpRight, label: 'New Delivery', color: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/20', href: '/operations' }
                    ].map((action, index) => (
                        <motion.a
                            key={action.label}
                            href={action.href}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 + index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            className={clsx(
                                "relative overflow-hidden rounded-2xl backdrop-blur-xl border p-6 group cursor-pointer transition-all duration-300",
                                isDark 
                                    ? `bg-gradient-to-br ${action.color} ${action.border}`
                                    : "bg-white border-slate-200 shadow-md hover:shadow-lg"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={clsx(
                                    "p-3 rounded-xl border group-hover:scale-110 transition-transform",
                                    isDark 
                                        ? "bg-white/5 border-white/10"
                                        : "bg-indigo-100 border-indigo-200"
                                )}>
                                    <action.icon className={clsx(
                                        "w-6 h-6",
                                        isDark ? "text-white/80" : "text-indigo-600"
                                    )} />
                                </div>
                                <div>
                                    <div className={clsx(
                                        "text-sm font-semibold mb-1",
                                        isDark ? "text-white/60" : "text-slate-600"
                                    )}>Quick Action</div>
                                    <div className={clsx(
                                        "text-lg font-bold",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>{action.label}</div>
                                </div>
                            </div>
                            <motion.div
                                className={clsx(
                                    "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent to-transparent",
                                    isDark ? "via-white/20" : "via-indigo-300"
                                )}
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.6 }}
                            />
                        </motion.a>
                    ))}
                </motion.div>
            </div>
        </Layout>
    );
};

export default Dashboard;