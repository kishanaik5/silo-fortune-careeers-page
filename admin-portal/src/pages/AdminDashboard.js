import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Briefcase, FileText, CheckCircle, XCircle, Clock, Users, ArrowRight, TrendingUp, Ticket, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { isAuthenticated, logout, isLoading, admin } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/admin-login');
        }

        // Fetch from Backend API
        const fetchApplications = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/applications');
                if (response.ok) {
                    const data = await response.json();
                    setApplications(data);
                }
            } catch (error) {
                console.error('Error fetching applications:', error);
            }
        };

        if (isAuthenticated) {
            fetchApplications();
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-emerald-800 font-bold">Loading Dashboard...</div>;

    const stats = [
        {
            label: "Total Applications",
            value: applications.length,
            icon: <Users size={24} />,
            color: "blue",
            bg: "bg-blue-50",
            text: "text-blue-600",
            border: "border-blue-200"
        },
        {
            label: "Pending Review",
            value: applications.filter(a => a.status === 'Pending').length,
            icon: <Clock size={24} />,
            color: "amber",
            bg: "bg-amber-50",
            text: "text-amber-600",
            border: "border-amber-200"
        },
        {
            label: "Shortlisted",
            value: applications.filter(a => a.status === 'Shortlisted').length,
            icon: <CheckCircle size={24} />,
            color: "emerald",
            bg: "bg-emerald-50",
            text: "text-emerald-600",
            border: "border-emerald-200"
        },
        {
            label: "Rejected",
            value: applications.filter(a => a.status === 'Rejected').length,
            icon: <XCircle size={24} />,
            color: "red",
            bg: "bg-red-50",
            text: "text-red-600",
            border: "border-red-200"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-emerald-900 text-white py-4 px-8 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
                            <span className="font-bold tracking-widest text-sm">SILO</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        {admin && (
                            <div className="hidden md:flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold shadow-inner">
                                    {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <div className="text-xs text-emerald-50">
                                    <p className="font-bold text-sm text-white">{admin.name || 'Admin'}</p>
                                    <p className="opacity-80">{admin.email}</p>
                                </div>
                            </div>
                        )}
                        <button onClick={logout} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-200 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium border border-red-500/20">
                            <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-10 flex-1 max-w-7xl">

                {/* Welcome Section */}
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
                    <p className="text-gray-500">Welcome back, here's what's happening today.</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, index) => (
                        <div key={index} className={`bg-white p-6 rounded-2xl shadow-sm border ${stat.border} hover:shadow-md transition-shadow`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.text}`}>
                                    {stat.icon}
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.bg} ${stat.text} uppercase tracking-wider`}>
                                    {stat.label}
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                            <p className="text-gray-400 text-sm">Updated just now</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Briefcase size={20} className="text-emerald-600" /> Quick Actions
                </h3>

                {/* Navigation Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1: Manage Jobs */}
                    <div onClick={() => navigate('/admin-manage-jobs')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl w-fit mb-4 relative z-10 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                            <Briefcase size={24} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2 relative z-10">Manage Jobs</h2>
                        <p className="text-sm text-gray-500 mb-6 relative z-10">Create, edit, or remove job listings from the portal.</p>
                        <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                            Open Manager <ArrowRight size={16} className="ml-1" />
                        </div>
                    </div>

                    {/* Card 2: Job Applications */}
                    <div onClick={() => navigate('/admin-job-roles')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl w-fit mb-4 relative z-10 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                            <FileText size={24} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2 relative z-10">Job Applications</h2>
                        <p className="text-sm text-gray-500 mb-6 relative z-10">Review applications by role and export data.</p>
                        <div className="flex items-center text-indigo-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                            View Applications <ArrowRight size={16} className="ml-1" />
                        </div>
                    </div>

                    {/* Card 3: Evaluation Sheet */}
                    <div onClick={() => navigate('/admin-evaluation')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl w-fit mb-4 relative z-10 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                            <TrendingUp size={24} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2 relative z-10">Evaluation Sheet</h2>
                        <p className="text-sm text-gray-500 mb-6 relative z-10">Track interview rounds and scores for candidates.</p>
                        <div className="flex items-center text-emerald-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                            Go to Sheet <ArrowRight size={16} className="ml-1" />
                        </div>
                    </div>

                    {/* Card 4: Selected Candidates */}
                    <div onClick={() => navigate('/admin-selected-candidates')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl w-fit mb-4 relative z-10 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                            <CheckCircle size={24} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2 relative z-10">Selected Candidates</h2>
                        <p className="text-sm text-gray-500 mb-6 relative z-10">Finalize offers and send selection emails.</p>
                        <div className="flex items-center text-amber-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                            View Selected <ArrowRight size={16} className="ml-1" />
                        </div>
                    </div>

                    {/* Card 5: Event Registrations */}
                    <div onClick={() => navigate('/admin-event-registrations')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl w-fit mb-4 relative z-10 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                            <Ticket size={24} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2 relative z-10">Event Registrations</h2>
                        <p className="text-sm text-gray-500 mb-6 relative z-10">View list of users registered for events.</p>
                        <div className="flex items-center text-purple-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                            View Registrations <ArrowRight size={16} className="ml-1" />
                        </div>
                    </div>

                    {/* Card 6: Manage Events */}
                    <div onClick={() => navigate('/admin-manage-events')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="p-3 bg-teal-100 text-teal-600 rounded-xl w-fit mb-4 relative z-10 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                            <Calendar size={24} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2 relative z-10">Manage Events</h2>
                        <p className="text-sm text-gray-500 mb-6 relative z-10">Create new events and set ticket limits.</p>
                        <div className="flex items-center text-teal-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                            Manage Events <ArrowRight size={16} className="ml-1" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
