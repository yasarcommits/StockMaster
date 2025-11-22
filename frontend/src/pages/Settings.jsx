import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { MapPin, Plus, X, Loader2, Building2 } from 'lucide-react';
import clsx from 'clsx';

const Settings = () => {
    const { isDark } = useTheme();
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newLocation, setNewLocation] = useState({ name: '', address: '' });

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
            await api.post('/ops/locations', newLocation);
            setIsModalOpen(false);
            setNewLocation({ name: '', address: '' });
            fetchLocations();
        } catch (error) {
            console.error("Failed to create location", error);
            alert(error.response?.data?.error || 'Failed to create location');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="page-title">Settings</h1>
                        <p className="page-subtitle">Manage your warehouses and system configurations</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                    >
                        <Plus className="w-5 h-5" />
                        Add Location
                    </button>
                </div>

                <div className="space-y-4">
                    <h2 className={clsx(
                        "text-xl font-bold flex items-center gap-2",
                        isDark ? "text-white" : "text-slate-900"
                    )}>
                        <Building2 className={clsx(
                            "w-5 h-5",
                            isDark ? "text-indigo-400" : "text-indigo-600"
                        )} />
                        Warehouses & Locations
                    </h2>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : locations.length === 0 ? (
                        <div className={clsx(
                            "p-8 text-center rounded-2xl",
                            isDark 
                                ? "glass-card text-slate-400"
                                : "bg-white border border-slate-200 text-slate-600 shadow-md"
                        )}>
                            No locations found. Add your first warehouse to get started.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {locations.map((loc) => (
                                <div 
                                    key={loc.id} 
                                    className={clsx(
                                        "p-6 group relative overflow-hidden transition-colors rounded-2xl",
                                        isDark 
                                            ? "glass-card hover:bg-white/5"
                                            : "bg-white hover:bg-slate-50 border border-slate-200 shadow-md hover:shadow-lg"
                                    )}
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MapPin className={clsx(
                                            "w-24 h-24 -rotate-12 transform translate-x-8 -translate-y-8",
                                            isDark ? "text-indigo-500/5" : "text-indigo-500/10"
                                        )} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className={clsx(
                                            "w-12 h-12 rounded-xl flex items-center justify-center mb-4 border transition-colors",
                                            isDark 
                                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                                : "bg-indigo-100 text-indigo-600 border-indigo-200 group-hover:bg-indigo-200"
                                        )}>
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <h3 className={clsx(
                                            "text-lg font-bold mb-1",
                                            isDark ? "text-white" : "text-slate-900"
                                        )}>{loc.name}</h3>
                                        <p className={clsx(
                                            "text-sm leading-relaxed",
                                            isDark ? "text-slate-400" : "text-slate-600"
                                        )}>
                                            {loc.address || 'No address provided'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Location Modal */}
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
                                "relative w-full max-w-md overflow-hidden shadow-2xl",
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
                                )}>Add New Location</h2>
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

                            <form onSubmit={handleCreateLocation} className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <label className={clsx(
                                        "text-sm font-medium",
                                        isDark ? "text-slate-400" : "text-slate-700"
                                    )}>Location Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newLocation.name}
                                        onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g. Main Warehouse"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className={clsx(
                                        "text-sm font-medium",
                                        isDark ? "text-slate-400" : "text-slate-700"
                                    )}>Address</label>
                                    <textarea
                                        rows="3"
                                        value={newLocation.address}
                                        onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                                        className="input-field resize-none"
                                        placeholder="e.g. 123 Storage Lane, Industrial District"
                                    />
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
                                                Saving...
                                            </div>
                                        ) : 'Add Location'}
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

export default Settings;