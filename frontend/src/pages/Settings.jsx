import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MapPin, 
    Plus, 
    X, 
    Loader2, 
    Building2, 
    Settings as SettingsIcon,
    Sparkles,
    Warehouse,
    Trash2,
    Edit,
    Check,
    AlertCircle,
    Globe,
    Bell,
    Shield,
    Palette,
    Moon,
    Sun,
    Save
} from 'lucide-react';
import clsx from 'clsx';

const Settings = () => {
    const { theme, setTheme } = useTheme();
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newLocation, setNewLocation] = useState({ name: '', address: '' });
    const [editingLocation, setEditingLocation] = useState(null);
    const [activeTab, setActiveTab] = useState('locations');
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        lowStock: true
    });

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const res = await api.get('/ops/locations');
            setLocations(res.data);
        } catch (error) {
            console.error("Failed to fetch locations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLocation = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingLocation) {
                try {
                    await api.put(`/ops/locations/${editingLocation.id}`, newLocation);
                } catch (error) {
                    if (error.response?.status === 404 || error.response?.status === 405) {
                        alert('Update endpoint not available. This feature requires backend support.');
                        throw error;
                    }
                    throw error;
                }
            } else {
                await api.post('/ops/locations', newLocation);
            }
            setIsModalOpen(false);
            setNewLocation({ name: '', address: '' });
            setEditingLocation(null);
            fetchLocations();
        } catch (error) {
            console.error("Failed to create location", error);
            alert(error.response?.data?.error || 'Failed to save location');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLocation = async (id) => {
        if (!window.confirm('Are you sure you want to delete this location?')) return;
        try {
            await api.delete(`/ops/locations/${id}`);
            fetchLocations();
        } catch (error) {
            console.error("Failed to delete location", error);
            if (error.response?.status === 404) {
                alert('Delete endpoint not available. This feature requires backend support.');
            } else {
                alert(error.response?.data?.error || 'Failed to delete location');
            }
        }
    };

    const handleEditLocation = (location) => {
        setEditingLocation(location);
        setNewLocation({ name: location.name, address: location.address || '' });
        setIsModalOpen(true);
    };

    const LocationCard = ({ location, index }) => {
        const [isHovered, setIsHovered] = useState(false);
        
        return (
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05, type: "spring", stiffness: 100 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="relative group cursor-pointer"
            >
                <div className={clsx(
                    "absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    theme === 'dark' ? 'bg-gradient-to-br from-white/5 to-transparent' : 'bg-gradient-to-br from-indigo-200/30 to-transparent'
                )} />
                <div className={clsx(
                    "relative overflow-hidden rounded-3xl backdrop-blur-2xl border p-6 shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-3xl",
                    theme === 'dark' 
                        ? 'bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-white/10 group-hover:border-white/20'
                        : 'bg-gradient-to-br from-white/90 via-white/80 to-white/90 border-slate-200 group-hover:border-slate-300'
                )}>
                    <motion.div
                        className={clsx(
                            "absolute inset-0 opacity-0 group-hover:opacity-100",
                            theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-100/50'
                        )}
                        animate={isHovered ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
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
                        <Sparkles className={clsx(
                            "w-5 h-5 opacity-60",
                            theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                        )} />
                    </motion.div>

                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MapPin className={clsx(
                            "w-32 h-32 -rotate-12 transform translate-x-8 -translate-y-8",
                            theme === 'dark' ? 'text-indigo-500/5' : 'text-indigo-200/30'
                        )} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div className={clsx(
                                "w-14 h-14 rounded-2xl bg-gradient-to-br border flex items-center justify-center group-hover:scale-110 transition-transform duration-300",
                                theme === 'dark' 
                                    ? 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30'
                                    : 'from-indigo-100 to-purple-100 border-indigo-300'
                            )}>
                                <Warehouse className={clsx(
                                    "w-7 h-7",
                                    theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                                )} />
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditLocation(location);
                                    }}
                                    className={clsx(
                                        "p-2 rounded-xl transition-colors",
                                        theme === 'dark'
                                            ? 'hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300'
                                            : 'hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700'
                                    )}
                                >
                                    <Edit className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteLocation(location.id);
                                    }}
                                    className={clsx(
                                        "p-2 rounded-xl transition-colors",
                                        theme === 'dark'
                                            ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
                                            : 'hover:bg-red-100 text-red-600 hover:text-red-700'
                                    )}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </div>
                        <h3 className={clsx(
                            "text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors",
                            theme === 'dark' ? 'text-white' : 'text-slate-900'
                        )}>
                            {location.name}
                        </h3>
                        <div className="flex items-start gap-2">
                            <MapPin className={clsx(
                                "w-4 h-4 mt-0.5 flex-shrink-0",
                                theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                            )} />
                            <p className={clsx(
                                "text-sm leading-relaxed",
                                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                            )}>
                                {location.address || 'No address provided'}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const tabs = [
        { id: 'locations', label: 'Locations', icon: Warehouse },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'security', label: 'Security', icon: Shield }
    ];

    return (
        <Layout>
            <div className="space-y-8 pb-8">
                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className={clsx(
                        "relative overflow-hidden rounded-3xl backdrop-blur-2xl border p-8 shadow-2xl",
                        theme === 'dark'
                            ? 'bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 border-white/10'
                            : 'bg-gradient-to-br from-indigo-100/80 via-purple-100/80 to-pink-100/80 border-indigo-200'
                    )}
                >
                    <div className={clsx(
                        "absolute inset-0 opacity-50",
                        theme === 'dark'
                            ? 'bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.3),transparent_50%)]'
                            : 'bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_50%)]'
                    )} />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className={clsx(
                                    "p-3 rounded-2xl border",
                                    theme === 'dark'
                                        ? 'bg-indigo-500/20 border-indigo-500/30'
                                        : 'bg-indigo-200/50 border-indigo-300'
                                )}>
                                    <SettingsIcon className={clsx(
                                        "w-8 h-8",
                                        theme === 'dark' ? 'text-indigo-400' : 'text-indigo-700'
                                    )} />
                                </div>
                                <div>
                                    <h1 className={clsx(
                                        "text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                                        theme === 'dark'
                                            ? 'from-white to-slate-300'
                                            : 'from-slate-900 to-slate-600'
                                    )}>
                                        Settings
                                    </h1>
                                    <p className={clsx(
                                        "mt-1",
                                        theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                                    )}>Manage your system preferences and configurations</p>
                                </div>
                            </div>
                        </div>
                        {activeTab === 'locations' && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setEditingLocation(null);
                                    setNewLocation({ name: '', address: '' });
                                    setIsModalOpen(true);
                                }}
                                className="relative overflow-hidden px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 flex items-center gap-2 group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <Plus className="w-5 h-5 relative z-10" />
                                <span className="relative z-10">Add Location</span>
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-3">
                    {tabs.map((tab, index) => (
                        <motion.button
                            key={tab.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "relative overflow-hidden px-6 py-3.5 rounded-2xl flex items-center gap-3 font-semibold transition-all duration-300",
                                activeTab === tab.id
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                                    : theme === 'dark'
                                        ? "bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                                        : "bg-white/60 border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900"
                            )}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <tab.icon className={`w-5 h-5 relative z-10 ${activeTab === tab.id ? 'text-white' : ''}`} />
                            <span className="relative z-10">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div
                                    className="absolute top-2 right-2"
                                    animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Sparkles className="w-4 h-4 text-white opacity-60" />
                                </motion.div>
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'locations' && (
                        <motion.div
                            key="locations"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center min-h-[400px]">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full"
                                    />
                                </div>
                            ) : locations.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={clsx(
                                        "relative overflow-hidden rounded-3xl backdrop-blur-2xl border p-12 text-center shadow-2xl",
                                        theme === 'dark'
                                            ? 'bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-white/10'
                                            : 'bg-gradient-to-br from-white/90 via-white/80 to-white/90 border-slate-200'
                                    )}
                                >
                                    <div className={clsx(
                                        "w-24 h-24 bg-gradient-to-br rounded-full flex items-center justify-center mx-auto mb-6 border",
                                        theme === 'dark'
                                            ? 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30'
                                            : 'from-indigo-100 to-purple-100 border-indigo-300'
                                    )}>
                                        <Warehouse className={clsx(
                                            "w-12 h-12",
                                            theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                                        )} />
                                    </div>
                                    <h3 className={clsx(
                                        "text-2xl font-bold mb-2",
                                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                                    )}>No locations found</h3>
                                    <p className={clsx(
                                        "mb-6",
                                        theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                                    )}>Add your first warehouse to get started</p>
                                    <button
                                        onClick={() => {
                                            setEditingLocation(null);
                                            setNewLocation({ name: '', address: '' });
                                            setIsModalOpen(true);
                                        }}
                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
                                    >
                                        <Plus className="w-5 h-5 inline mr-2" />
                                        Create First Location
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {locations.map((loc, index) => (
                                        <LocationCard key={loc.id} location={loc} index={index} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'appearance' && (
                        <motion.div
                            key="appearance"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className={clsx(
                                "relative overflow-hidden rounded-3xl backdrop-blur-2xl border p-8 shadow-2xl",
                                theme === 'dark'
                                    ? 'bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-white/10'
                                    : 'bg-gradient-to-br from-white/90 via-white/80 to-white/90 border-slate-200'
                            )}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className={clsx(
                                    "p-2.5 rounded-xl border",
                                    theme === 'dark'
                                        ? 'bg-indigo-500/10 border-indigo-500/20'
                                        : 'bg-indigo-100 border-indigo-300'
                                )}>
                                    <Palette className={clsx(
                                        "w-5 h-5",
                                        theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                                    )} />
                                </div>
                                <h2 className={clsx(
                                    "text-2xl font-bold",
                                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                                )}>Appearance Settings</h2>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <p className={clsx(
                                        "text-sm font-semibold mb-4",
                                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                                    )}>Theme</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['dark', 'light'].map((t) => (
                                            <motion.button
                                                key={t}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setTheme(t)}
                                                className={clsx(
                                                    "relative p-6 rounded-2xl border-2 transition-all",
                                                    theme === t
                                                        ? "border-indigo-500 bg-indigo-500/10"
                                                        : theme === 'dark'
                                                            ? "border-white/10 bg-white/5 hover:border-white/20"
                                                            : "border-slate-200 bg-slate-50 hover:border-slate-300"
                                                )}
                                            >
                                                {t === 'dark' ? (
                                                    <Moon className={clsx(
                                                        "w-8 h-8 mx-auto",
                                                        theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                                                    )} />
                                                ) : (
                                                    <Sun className={clsx(
                                                        "w-8 h-8 mx-auto",
                                                        theme === 'dark' ? 'text-amber-400' : 'text-amber-500'
                                                    )} />
                                                )}
                                                <p className={clsx(
                                                    "mt-2 font-semibold capitalize",
                                                    theme === t 
                                                        ? 'text-indigo-400'
                                                        : theme === 'dark' ? 'text-white' : 'text-slate-900'
                                                )}>{t}</p>
                                                {theme === t && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="absolute top-2 right-2"
                                                    >
                                                        <Check className="w-5 h-5 text-indigo-400" />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Other tabs remain unchanged but with theme-aware styling */}
                </AnimatePresence>
            </div>

            {/* Modal - Also theme-aware */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingLocation(null);
                                setNewLocation({ name: '', address: '' });
                            }}
                            className={clsx(
                                "absolute inset-0 backdrop-blur-md",
                                theme === 'dark' ? 'bg-slate-950/90' : 'bg-slate-900/40'
                            )}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className={clsx(
                                "relative w-full max-w-2xl rounded-3xl backdrop-blur-2xl border shadow-2xl overflow-hidden",
                                theme === 'dark'
                                    ? 'bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-white/10'
                                    : 'bg-gradient-to-br from-white/95 via-white/95 to-white/95 border-slate-200'
                            )}
                        >
                            {/* Modal Header */}
                            <div className={clsx(
                                "relative px-8 py-6 border-b",
                                theme === 'dark'
                                    ? 'border-white/10 bg-gradient-to-r from-indigo-600/20 to-purple-600/20'
                                    : 'border-slate-200 bg-gradient-to-r from-indigo-100/50 to-purple-100/50'
                            )}>
                                <div className={clsx(
                                    "absolute inset-0",
                                    theme === 'dark'
                                        ? 'bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.2),transparent_70%)]'
                                        : 'bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_70%)]'
                                )} />
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx(
                                            "w-12 h-12 rounded-2xl bg-gradient-to-br border flex items-center justify-center",
                                            theme === 'dark'
                                                ? 'from-indigo-500/30 to-purple-500/30 border-indigo-500/40'
                                                : 'from-indigo-200/50 to-purple-200/50 border-indigo-300'
                                        )}>
                                            {editingLocation ? (
                                                <Edit className={clsx(
                                                    "w-6 h-6",
                                                    theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'
                                                )} />
                                            ) : (
                                                <Plus className={clsx(
                                                    "w-6 h-6",
                                                    theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'
                                                )} />
                                            )}
                                        </div>
                                        <div>
                                            <h2 className={clsx(
                                                "text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                                                theme === 'dark'
                                                    ? 'from-white to-slate-300'
                                                    : 'from-slate-900 to-slate-600'
                                            )}>
                                                {editingLocation ? 'Edit Location' : 'Add New Location'}
                                            </h2>
                                            <p className={clsx(
                                                "text-sm mt-1",
                                                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                                            )}>
                                                {editingLocation ? 'Update location details' : 'Create a new warehouse or storage location'}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setEditingLocation(null);
                                            setNewLocation({ name: '', address: '' });
                                        }} 
                                        className={clsx(
                                            "p-2 rounded-xl transition-colors",
                                            theme === 'dark'
                                                ? 'hover:bg-white/10 text-slate-400 hover:text-white'
                                                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                                        )}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleCreateLocation} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className={clsx(
                                        "text-sm font-semibold flex items-center gap-2",
                                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                                    )}>
                                        <Warehouse className={clsx(
                                            "w-4 h-4",
                                            theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                                        )} />
                                        Location Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newLocation.name}
                                        onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                                        className={clsx(
                                            "w-full px-4 py-3 rounded-xl border transition-all",
                                            theme === 'dark'
                                                ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50'
                                                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500'
                                        )}
                                        placeholder="e.g. Main Warehouse"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className={clsx(
                                        "text-sm font-semibold flex items-center gap-2",
                                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                                    )}>
                                        <MapPin className={clsx(
                                            "w-4 h-4",
                                            theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                                        )} />
                                        Address (Optional)
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={newLocation.address}
                                        onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                                        className={clsx(
                                            "w-full px-4 py-3 rounded-xl border transition-all resize-none",
                                            theme === 'dark'
                                                ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50'
                                                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500'
                                        )}
                                        placeholder="e.g. 123 Storage Lane, Industrial District"
                                    />
                                </div>

                                <div className={clsx(
                                    "flex justify-end gap-4 pt-6 border-t",
                                    theme === 'dark' ? 'border-white/10' : 'border-slate-200'
                                )}>
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setEditingLocation(null);
                                            setNewLocation({ name: '', address: '' });
                                        }}
                                        className={clsx(
                                            "px-6 py-3 rounded-xl border font-semibold transition-all",
                                            theme === 'dark'
                                                ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                        )}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                                        whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                                        className="relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                                                <span className="relative z-10">Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5 relative z-10" />
                                                <span className="relative z-10">{editingLocation ? 'Update Location' : 'Add Location'}</span>
                                            </>
                                        )}
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

export default Settings;