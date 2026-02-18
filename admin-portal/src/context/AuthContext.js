import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [admin, setAdmin] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedAuth = localStorage.getItem('silo_admin_auth');
        const storedAdmin = localStorage.getItem('silo_admin_details');

        if (storedAuth === 'true') {
            setIsAuthenticated(true);
            if (storedAdmin) {
                setAdmin(JSON.parse(storedAdmin));
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                setIsAuthenticated(true);
                setAdmin(data.admin);
                localStorage.setItem('silo_admin_auth', 'true');
                localStorage.setItem('silo_admin_details', JSON.stringify(data.admin));
                return { success: true };
            } else {
                return { success: false, error: data.error || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setAdmin(null);
        localStorage.removeItem('silo_admin_auth');
        localStorage.removeItem('silo_admin_details');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, admin, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
