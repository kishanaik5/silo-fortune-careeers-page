import React, { createContext, useState, useContext, useEffect } from 'react';

const CandidateAuthContext = createContext(null);

export const CandidateAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('candidate_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('candidate_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('candidate_user');
    };

    return (
        <CandidateAuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </CandidateAuthContext.Provider>
    );
};

export const useCandidateAuth = () => useContext(CandidateAuthContext);
