import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Verify token or get user profile
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                } catch (error) {
                    console.error("Auth check failed", error);
                    // Only logout if strictly unauthorized
                    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                        localStorage.removeItem('token');
                        setUser(null);
                    } else {
                        // For other errors (404, 500), we might want to keep the user logged in optimistically
                        // or at least not destroy the session immediately if it's just a network blip.
                        // However, if /me 404s (backend old), we can't get user data.
                        // We'll try to decode the token to get basic info if possible, or just fail safely.
                        // For now, let's not remove token, but user will be null, so ProtectedRoute will redirect.
                        // We should probably set a temporary user object from token if possible, but let's stick to safe fail.
                        if (error.response?.status === 404) {
                            console.warn("Backend endpoint /auth/me not found. Please restart backend server.");
                        }
                        localStorage.removeItem('token'); // Safest for now to avoid stuck state
                    }
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        setUser(user || { token }); // Fallback if user object isn't returned
        return user;
    };

    const register = async (username, email, password) => {
        // Backend expects 'name', 'email', 'password'
        const res = await api.post('/auth/signup', { name: username, email, password });
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
