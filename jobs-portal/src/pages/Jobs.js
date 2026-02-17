import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, ArrowRight, Search, Filter, Clock } from 'lucide-react';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        type: 'All',
        experience: 'All',
        category: 'All'
    });
    const navigate = useNavigate();

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchJobs();
        }, 300);
        return () => clearTimeout(debounce);
    }, [filters]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.type && filters.type !== 'All') queryParams.append('type', filters.type);
            if (filters.experience && filters.experience !== 'All') queryParams.append('experience', filters.experience);
            if (filters.category && filters.category !== 'All') queryParams.append('category', filters.category);

            const response = await fetch(`http://localhost:5000/api/jobs?${queryParams}`);
            if (response.ok) {
                const data = await response.json();
                setJobs(data);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatExperience = (exp) => {
        if (!exp) return '';
        const lower = exp.toLowerCase();
        if (lower === 'fresher') return 'Fresher (0-1 yrs)';
        if (lower === 'junior') return 'Junior (1-3 yrs)';
        if (lower === 'mid-level') return 'Mid-Level (3-5 yrs)';
        if (lower === 'senior') return 'Senior (5+ yrs)';
        return exp;
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Header */}
            <div className="bg-emerald-900 text-white py-16 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Current Openings</h1>
                    <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">
                        Join our team and help us revolutionize sustainable agriculture with cutting-edge technology.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-lg flex flex-col md:flex-row gap-2">
                        <div className="flex-1 flex items-center px-4 bg-gray-50 rounded-xl">
                            <Search className="text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by job title, department, or keywords..."
                                className="w-full bg-transparent p-3 outline-none text-gray-700 placeholder-gray-400"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Job Listings */}
            <div className="container mx-auto px-6 py-12 max-w-6xl">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="md:w-64 flex-shrink-0 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold">
                                <Filter size={18} /> Filters
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                    <select
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-500 transition"
                                        value={filters.category}
                                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                    >
                                        <option value="All">All Categories</option>
                                        <option value="Developers">Developers</option>
                                        <option value="Marketing">Marketing</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
                                    <select
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-500 transition"
                                        value={filters.type}
                                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                    >
                                        <option value="All">All Types</option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Level</label>
                                    <select
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-500 transition"
                                        value={filters.experience}
                                        onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                                    >
                                        <option value="All">Any Experience</option>
                                        <option value="Fresher">Fresher (0-1 yrs)</option>
                                        <option value="Junior">Junior (1-3 yrs)</option>
                                        <option value="Mid-Level">Mid-Level (3-5 yrs)</option>
                                        <option value="Senior">Senior (5+ yrs)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Jobs Grid */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {loading ? 'Searching...' : `${jobs.length} Positions Found`}
                            </h2>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
                                <p className="text-gray-500">Finding opportunities...</p>
                            </div>
                        ) : (
                            <div className="grid gap-5">
                                {jobs.map((job) => (
                                    <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition group relative overflow-hidden">
                                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition">{job.title}</h3>
                                                    <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-100">
                                                        {job.department}
                                                    </span>
                                                    {job.category && (
                                                        <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium border border-purple-100">
                                                            {job.category}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-6 text-gray-500 text-sm mt-3 flex-wrap">
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin size={16} className="text-gray-400" /> {job.location}
                                                    </span>
                                                    {job.type && job.type !== 'Remote' && (
                                                        <span className="flex items-center gap-1.5">
                                                            <Briefcase size={16} className="text-gray-400" /> {job.type}
                                                        </span>
                                                    )}
                                                    {job.experience && (
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock size={16} className="text-gray-400" /> {formatExperience(job.experience)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => navigate(`/${encodeURIComponent(job.title)}/${encodeURIComponent(job.department)}/${encodeURIComponent(job.type)}`, { state: { job } })}
                                                className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-emerald-600 transition flex items-center gap-2 whitespace-nowrap shadow-lg shadow-gray-200 group-hover:shadow-emerald-200"
                                            >
                                                Apply Now <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {jobs.length === 0 && (
                                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
                                        <div className="flex justify-center mb-4">
                                            <Search className="text-gray-300" size={48} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-700 mb-1">No jobs found</h3>
                                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                                        <button
                                            onClick={() => setFilters({ search: '', type: 'All', experience: 'All', category: 'All' })}
                                            className="mt-4 text-emerald-600 font-medium hover:underline"
                                        >
                                            Clear all filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Jobs;
