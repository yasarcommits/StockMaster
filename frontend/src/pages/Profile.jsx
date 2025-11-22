import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Edit2, Save, X, Loader2 } from 'lucide-react';

const Profile = () => {
    const { user, loading: authLoading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '' });

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name || '', email: user.email || '' });
        }
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.put('/auth/profile', formData);
            // Ideally update context user here, but for now we rely on page refresh or local state
            setIsEditing(false);
            alert('Profile updated successfully');
            window.location.reload(); // Simple way to refresh context
        } catch (error) {
            console.error("Failed to update profile", error);
            alert(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Manage your account settings</p>
                </div>

                <div className="glass-card p-8 relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center text-center mb-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl mb-4 border-4 border-slate-900">
                            <User className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                        <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
                            <Shield className="w-3 h-3" />
                            {user?.role?.replace('_', ' ').toUpperCase()}
                        </div>
                    </div>

                    {!isEditing ? (
                        <div className="space-y-6">
                            <div className="grid gap-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Full Name</p>
                                        <p className="text-white font-medium">{user?.name}</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email Address</p>
                                        <p className="text-white font-medium">{user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full btn-secondary flex items-center justify-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors font-medium flex items-center justify-center gap-2"
                                    disabled={isSubmitting}
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
