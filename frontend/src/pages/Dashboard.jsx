import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Package, Layers, ArrowDownLeft, ArrowUpRight, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="relative overflow-hidden p-6 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm group hover:bg-slate-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10"
    >
        <div className={`absolute top-0 right-0 p-20 rounded-full ${color} opacity-5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity`} />

        <div className="relative z-10 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{title}</p>
                <h3 className="text-3xl font-bold mt-2 text-white tracking-tight">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
    </motion.div>
);

const Dashboard = () => {
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
    const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981'];

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

    return (
        <Layout>
            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            {getGreeting()}, <span className="text-indigo-400">{stats.totalProducts > 0 ? 'Admin' : 'User'}</span>
                        </h1>
                        <p className="text-slate-400 mt-1">Here's what's happening with your inventory today.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        System Operational
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Products"
                        value={stats.totalProducts}
                        icon={Package}
                        color="bg-blue-500"
                        delay={0.1}
                    />
                    <StatCard
                        title="Total Stock"
                        value={stats.totalStock}
                        icon={Layers}
                        color="bg-purple-500"
                        delay={0.2}
                    />
                    <StatCard
                        title="Pending Receipts"
                        value={stats.pendingReceipts}
                        icon={ArrowDownLeft}
                        color="bg-emerald-500"
                        delay={0.3}
                    />
                    <StatCard
                        title="Pending Deliveries"
                        value={stats.pendingDeliveries}
                        icon={ArrowUpRight}
                        color="bg-orange-500"
                        delay={0.4}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stock Flow Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-2 glass-card p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-400" />
                                Stock Flow
                            </h3>
                            <select className="bg-slate-950 border border-slate-800 text-slate-400 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData.stockTrends}>
                                    <defs>
                                        <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc' }}
                                        itemStyle={{ color: '#f8fafc' }}
                                    />
                                    <Area type="monotone" dataKey="in" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" name="Stock In" />
                                    <Area type="monotone" dataKey="out" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" name="Stock Out" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Category Distribution (Mock) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-400" />
                            Top Categories
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData.categoryData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                    <XAxis type="number" stroke="#64748b" fontSize={12} hide />
                                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={80} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                        {chartData.categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Low Stock Alerts */}
                {stats.lowStockProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        className="glass-card overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-amber-500/5">
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Low Stock Alerts</h2>
                                <p className="text-xs text-slate-400">Products below reorder level</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-950/30 text-slate-400 uppercase text-xs font-semibold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Product Name</th>
                                        <th className="px-6 py-4">SKU</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {stats.lowStockProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">{product.name}</td>
                                            <td className="px-6 py-4 text-slate-400 font-mono">{product.sku}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                    Low Stock
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => window.location.href = '/operations'}
                                                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                                                >
                                                    Reorder
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
