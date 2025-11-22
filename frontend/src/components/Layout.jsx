import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    ArrowRightLeft,
    LogOut,
    Menu,
    X,
    User,
    Settings,
    ChevronRight,
    History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const SidebarItem = ({ icon: Icon, label, path, active }) => (
    <Link
        to={path}
        className={clsx(
            "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden",
            active
                ? "bg-indigo-600/20 text-white shadow-lg shadow-indigo-500/10 border border-indigo-500/30"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100 hover:border-white/5 border border-transparent"
        )}
    >
        {active && (
            <motion.div
                layoutId="active-glow"
                className="absolute inset-0 bg-indigo-600/10 blur-xl"
                transition={{ duration: 0.3 }}
            />
        )}
        <Icon className={clsx("w-5 h-5 relative z-10 transition-colors", active ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400")} />
        <span className="font-medium relative z-10">{label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />}
    </Link>
);

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Package, label: 'Products', path: '/products' },
        { icon: ArrowRightLeft, label: 'Operations', path: '/operations' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-100 flex selection:bg-indigo-500/30">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex flex-col w-72 border-r border-white/5 bg-slate-950/50 backdrop-blur-2xl fixed h-full z-20">
                <div className="p-8">
                    <div className="flex items-center gap-4">
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <Package className="w-6 h-6 text-white relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
                                StockMaster
                            </h1>
                            <p className="text-xs text-slate-500 font-medium">Inventory System</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-2 mt-2">
                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menu</p>
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            {...item}
                            active={location.pathname === item.path}
                        />
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <Link to="/profile" className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-slate-200 group-hover:text-white transition-colors">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-500 truncate group-hover:text-slate-400 transition-colors">{user?.email}</p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                logout();
                            }}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </Link>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg text-white">StockMaster</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400 hover:text-white">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden fixed inset-0 z-20 bg-slate-950 pt-20 px-4 pb-6 flex flex-col"
                    >
                        <nav className="space-y-2 flex-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 py-4 rounded-xl border transition-all",
                                        location.pathname === item.path
                                            ? "bg-indigo-600/20 text-white border-indigo-500/30"
                                            : "bg-white/5 text-slate-400 border-transparent"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                    <ChevronRight className="ml-auto w-4 h-4 opacity-50" />
                                </Link>
                            ))}

                            <Link
                                to="/profile"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-4 rounded-xl border border-transparent bg-white/5 text-slate-400 mt-4"
                            >
                                <User className="w-5 h-5" />
                                <span className="font-medium">My Profile</span>
                                <ChevronRight className="ml-auto w-4 h-4 opacity-50" />
                            </Link>
                        </nav>

                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 mt-auto"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 md:pl-72 pt-20 md:pt-0 min-h-screen transition-all duration-300">
                <div className="p-6 md:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
