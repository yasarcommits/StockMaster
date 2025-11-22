import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
    History,
    Sun,
    Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const SidebarItem = ({ icon: Icon, label, path, active }) => {
    const { isDark } = useTheme();
    
    return (
        <Link
            to={path}
            className={clsx(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden",
                active
                    ? isDark 
                        ? "bg-indigo-600/20 text-theme-primary shadow-lg shadow-indigo-500/10 border border-indigo-500/30"
                        : "bg-indigo-100 text-indigo-900 shadow-md border border-indigo-200"
                    : isDark
                        ? "text-theme-secondary hover:bg-theme-secondary/10 hover:text-theme-primary border border-transparent"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
            )}
        >
            {active && (
                <motion.div
                    layoutId="active-glow"
                    className={clsx(
                        "absolute inset-0 blur-xl",
                        isDark ? "bg-indigo-600/10" : "bg-indigo-200/50"
                    )}
                    transition={{ duration: 0.3 }}
                />
            )}
            <Icon className={clsx(
                "w-5 h-5 relative z-10 transition-colors", 
                active 
                    ? (isDark ? "text-indigo-400" : "text-indigo-600")
                    : (isDark ? "text-theme-muted group-hover:text-indigo-400" : "text-slate-600 group-hover:text-indigo-600")
            )} />
            <span className="font-medium relative z-10">{label}</span>
            {active && (
                <div className={clsx(
                    "ml-auto w-1.5 h-1.5 rounded-full",
                    isDark ? "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" : "bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]"
                )} />
            )}
        </Link>
    );
};

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Package, label: 'Products', path: '/products' },
        { icon: ArrowRightLeft, label: 'Operations', path: '/operations' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="min-h-screen bg-theme-primary text-theme-primary flex selection:bg-indigo-500/30">
            {/* Sidebar - Desktop */}
            <aside className={clsx(
                "hidden md:flex flex-col w-72 theme-sidebar fixed h-full z-20",
                !isDark && "shadow-xl"
            )}>
                <div className="p-8">
                    <div className="flex items-center gap-4">
                        <div className={clsx(
                            "relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group overflow-hidden",
                            isDark 
                                ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20"
                                : "bg-gradient-to-br from-indigo-600 to-purple-700 shadow-indigo-600/30"
                        )}>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <Package className="w-6 h-6 text-white relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-theme-primary tracking-tight">
                                StockMaster
                            </h1>
                            <p className={clsx(
                                "text-xs font-medium",
                                isDark ? "text-theme-muted" : "text-slate-500"
                            )}>Inventory System</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-2 mt-2">
                    <div className="flex items-center justify-between px-4 mb-4">
                        <p className={clsx(
                            "text-xs font-semibold uppercase tracking-wider",
                            isDark ? "text-theme-muted" : "text-slate-500"
                        )}>Menu</p>
                        <button
                            onClick={toggleTheme}
                            className={clsx(
                                "p-1.5 rounded-lg border transition-all",
                                isDark 
                                    ? "bg-theme-secondary/20 border-theme-primary/20 hover:bg-theme-secondary/30 text-theme-secondary hover:text-indigo-400"
                                    : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-indigo-600"
                            )}
                            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            {...item}
                            active={location.pathname === item.path}
                        />
                    ))}
                </nav>

                <div className={clsx(
                    "p-6 border-t",
                    isDark ? "border-theme-primary/20" : "border-slate-200"
                )}>
                    <Link to="/profile" className={clsx(
                        "flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all group cursor-pointer",
                        isDark 
                            ? "bg-theme-secondary/20 border-theme-primary/20 hover:bg-theme-secondary/30"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 shadow-sm hover:shadow"
                    )}>
                        <div className={clsx(
                            "w-10 h-10 rounded-full flex items-center justify-center border transition-colors",
                            isDark 
                                ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/20 group-hover:border-indigo-500/40"
                                : "bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 border-indigo-200 group-hover:border-indigo-300"
                        )}>
                            <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-theme-primary transition-colors">{user?.name || 'User'}</p>
                            <p className={clsx(
                                "text-xs truncate transition-colors",
                                isDark ? "text-theme-secondary" : "text-slate-600"
                            )}>{user?.email}</p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                logout();
                            }}
                            className={clsx(
                                "p-2 rounded-lg transition-colors",
                                isDark 
                                    ? "hover:bg-red-500/10 text-theme-muted hover:text-red-400"
                                    : "hover:bg-red-50 text-slate-500 hover:text-red-600"
                            )}
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </Link>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className={clsx(
                "md:hidden fixed top-0 left-0 right-0 z-30 backdrop-blur-xl border-b px-4 py-3 flex items-center justify-between",
                isDark 
                    ? "bg-theme-primary/80 border-theme-primary/20"
                    : "bg-white/95 border-slate-200 shadow-sm"
            )}>
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isDark 
                            ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                            : "bg-gradient-to-br from-indigo-600 to-purple-700"
                    )}>
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg text-theme-primary">StockMaster</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className={clsx(
                            "p-2 transition-colors",
                            isDark 
                                ? "text-theme-secondary hover:text-theme-primary"
                                : "text-slate-600 hover:text-slate-900"
                        )}
                        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                        className={clsx(
                            "p-2 transition-colors",
                            isDark 
                                ? "text-theme-secondary hover:text-theme-primary"
                                : "text-slate-600 hover:text-slate-900"
                        )}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden fixed inset-0 z-20 bg-theme-primary pt-20 px-4 pb-6 flex flex-col"
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
                                            ? isDark 
                                                ? "bg-indigo-600/20 text-theme-primary border-indigo-500/30"
                                                : "bg-indigo-100 text-indigo-900 border-indigo-200"
                                            : isDark
                                                ? "bg-theme-secondary/10 text-theme-secondary border-transparent"
                                                : "bg-slate-50 text-slate-700 border-slate-200"
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
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-4 rounded-xl border mt-4",
                                    isDark 
                                        ? "border-transparent bg-theme-secondary/10 text-theme-secondary"
                                        : "bg-slate-50 text-slate-700 border-slate-200"
                                )}
                            >
                                <User className="w-5 h-5" />
                                <span className="font-medium">My Profile</span>
                                <ChevronRight className="ml-auto w-4 h-4 opacity-50" />
                            </Link>
                        </nav>

                        <button
                            onClick={logout}
                            className={clsx(
                                "w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl border mt-auto",
                                isDark 
                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                    : "bg-red-50 text-red-600 border-red-200"
                            )}
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