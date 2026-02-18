import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import Logo from '../assets/logo.png';

import { useCandidateAuth } from '../context/CandidateAuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useCandidateAuth();

    const isActive = (path) => location.pathname === path;

    if (location.pathname === '/login') return null;

    return (
        <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3">
                    <img src={Logo} alt="Silo Fortune" className="h-10 w-auto" />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link
                        to="/"
                        className={`font-medium transition ${isActive('/') ? 'text-emerald-600' : 'text-gray-600 hover:text-emerald-600'}`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/jobs"
                        className={`font-medium transition ${isActive('/jobs') ? 'text-emerald-600' : 'text-gray-600 hover:text-emerald-600'}`}
                    >
                        Jobs
                    </Link>
                    <Link
                        to="/events"
                        className={`font-medium transition ${isActive('/events') ? 'text-emerald-600' : 'text-gray-600 hover:text-emerald-600'}`}
                    >
                        Events
                    </Link>

                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition"
                            >
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
                                    <User size={18} />
                                </div>
                                <ChevronDown size={14} className="text-gray-400" />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-fade-in-up">
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg">
                                            {user.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Signed in as</p>
                                            <p className="text-sm font-bold text-gray-800 truncate" title={user.email}>{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium text-sm"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="px-6 py-2 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition shadow-md"
                        >
                            Sign In
                        </Link>
                    )}

                    <a
                        href="https://kishanaik5.github.io/silofortune-webpage-test/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition shadow-md hover:shadow-lg"
                    >
                        Visit Main Site
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-700 focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
                    <div className="flex flex-col p-6 space-y-4">
                        <Link
                            to="/"
                            onClick={() => setIsOpen(false)}
                            className={`font-medium text-lg ${isActive('/') ? 'text-emerald-600' : 'text-gray-600'}`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/jobs"
                            onClick={() => setIsOpen(false)}
                            className={`font-medium text-lg ${isActive('/jobs') ? 'text-emerald-600' : 'text-gray-600'}`}
                        >
                            Jobs
                        </Link>
                        <Link
                            to="/events"
                            onClick={() => setIsOpen(false)}
                            className={`font-medium text-lg ${isActive('/events') ? 'text-emerald-600' : 'text-gray-600'}`}
                        >
                            Events
                        </Link>
                        {user ? (
                            <div className="pt-4 border-t border-gray-100">
                                <div className="text-sm font-medium text-gray-700 mb-2">
                                    {user.email}
                                </div>
                                <button
                                    onClick={() => { logout(); setIsOpen(false); }}
                                    className="text-red-500 font-bold"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition shadow-md text-center"
                            >
                                Enroll
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
