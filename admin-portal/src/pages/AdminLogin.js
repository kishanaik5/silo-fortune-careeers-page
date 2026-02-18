import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Key, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/UI';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(username, password);
        if (result.success) {
            navigate('/admin-dashboard');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full flex flex-col animate-fade-in-up">
                <div className="bg-emerald-800 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-300">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white relative z-10">Restricted Access</h2>
                    <p className="text-emerald-200 text-sm relative z-10">Silo Fortune Admin Portal</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium text-center border border-red-200 animate-pulse">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-gray-900"
                                    placeholder="Enter admin ID"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Password</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-gray-900"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full justify-between group">
                            <span>Login</span>
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <a href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← Back to Website</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
