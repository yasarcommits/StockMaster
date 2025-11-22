import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, X, Loader2, Building2 } from 'lucide-react';

const Settings = () => {
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
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-indigo-400" />
                        Warehouses & Locations
                    </h2>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : locations.length === 0 ? (
                        <div className="glass-card p-8 text-center text-slate-400">
                            No locations found. Add your first warehouse to get started.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {locations.map((loc) => (
                                <div key={loc.id} className="glass-card p-6 hover:bg-white/5 transition-colors group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MapPin className="w-24 h-24 text-indigo-500/5 -rotate-12 transform translate-x-8 -translate-y-8" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-1">{loc.name}</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed">
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
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md glass-card overflow-hidden shadow-2xl"
                        >
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <h2 className="text-lg font-bold text-white">Add New Location</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateLocation} className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Location Name</label>
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
                                    <label className="text-sm font-medium text-slate-400">Address</label>
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
