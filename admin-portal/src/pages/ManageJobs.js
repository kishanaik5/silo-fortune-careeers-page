import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ManageJobs = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [newJob, setNewJob] = useState({
        title: '',
        location: '',
        type: 'Full-time',
        department: '',
        description: `Posted Date: ${new Date().toLocaleDateString()}\nJob ID: SILO-${Math.floor(1000 + Math.random() * 9000)}`,
        requirements: '',
        experience: '',
        category: 'Developers'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editJobId, setEditJobId] = useState(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/admin-login');
        }
        fetchJobs();
    }, [isAuthenticated, isLoading, navigate]);

    const fetchJobs = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/jobs');
            if (response.ok) {
                const data = await response.json();
                setJobs(data);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    const handleAddJob = async (e) => {
        e.preventDefault();
        const url = isEditing ? `http://localhost:5000/api/jobs/${editJobId}` : 'http://localhost:5000/api/jobs';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newJob)
            });

            if (response.ok) {
                fetchJobs();
                setNewJob({
                    title: '',
                    location: '',
                    type: 'Full-time',
                    department: '',
                    description: `Posted Date: ${new Date().toLocaleDateString()}\nJob ID: SILO-${Math.floor(1000 + Math.random() * 9000)}`,
                    requirements: '',
                    experience: '',
                    category: 'Developers'
                });
                setIsEditing(false);
                setEditJobId(null);
                alert(isEditing ? "Job updated successfully!" : "Job added successfully!");
            }
        } catch (error) {
            console.error('Error saving job:', error);
        }
    };

    const handleEditJob = (job) => {
        setNewJob({
            title: job.title,
            location: job.location,
            type: job.type || 'Full-time',
            department: job.department,
            description: job.description,
            requirements: job.requirements,
            experience: job.experience || '',
            category: job.category || 'Developers'
        });
        setEditJobId(job.id);
        setIsEditing(true);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditJobId(null);
        setNewJob({
            title: '',
            location: '',
            type: 'Full-time',
            department: '',
            description: `Posted Date: ${new Date().toLocaleDateString()}\nJob ID: SILO-${Math.floor(1000 + Math.random() * 9000)}`,
            requirements: '',
            experience: '',
            category: 'Developers'
        });
    };

    const handleDeleteJob = async (id) => {
        if (window.confirm("Are you sure you want to delete this job?")) {
            try {
                await fetch(`http://localhost:5000/api/jobs/${id}`, { method: 'DELETE' });
                fetchJobs();
            } catch (error) {
                console.error('Error deleting job:', error);
            }
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/admin-dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium">
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-8 border-b pb-6">
                        <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
                            <Briefcase size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Manage Job Roles</h1>
                            <p className="text-gray-500">Add, edit, or remove job listings.</p>
                        </div>
                    </div>

                    {/* Add/Edit Job Form */}
                    <form onSubmit={handleAddJob} className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{isEditing ? `Edit Job (ID: ${editJobId})` : 'Add New Role'}</h3>
                            {isEditing && <button type="button" onClick={handleCancelEdit} className="text-sm text-red-600 hover:underline">Cancel Edit</button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input required placeholder="Job Title" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} className="p-3 border rounded-lg text-sm w-full text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none" />
                            <input required placeholder="Department" value={newJob.department} onChange={e => setNewJob({ ...newJob, department: e.target.value })} className="p-3 border rounded-lg text-sm w-full text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none" />
                            <input required placeholder="Location" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} className="p-3 border rounded-lg text-sm w-full text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none" />
                            <div className="grid grid-cols-2 gap-4">
                                <select value={newJob.type} onChange={e => setNewJob({ ...newJob, type: e.target.value })} className="p-3 border rounded-lg text-sm w-full text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Remote</option>
                                    <option>Contract</option>
                                    <option>Internship</option>
                                </select>
                                <select value={newJob.experience} onChange={e => setNewJob({ ...newJob, experience: e.target.value })} className="p-3 border rounded-lg text-sm w-full text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="">Experience Level</option>
                                    <option value="Fresher">Fresher (0-1 yrs)</option>
                                    <option value="Junior">Junior (1-3 yrs)</option>
                                    <option value="Mid-Level">Mid-Level (3-5 yrs)</option>
                                    <option value="Senior">Senior (5+ yrs)</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <select value={newJob.category} onChange={e => setNewJob({ ...newJob, category: e.target.value })} className="p-3 border rounded-lg text-sm w-full text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="Developers">Developers</option>
                                    <option value="Marketing">Marketing</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-4 mb-4">
                            <textarea required placeholder="Job Description" rows="4" value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} className="p-3 border rounded-lg text-sm w-full text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                            <textarea required placeholder="Requirements (Key skills, qualifications, etc.)" rows="4" value={newJob.requirements} onChange={e => setNewJob({ ...newJob, requirements: e.target.value })} className="p-3 border rounded-lg text-sm w-full text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                        </div>
                        <button type="submit" className={`w-full text-white py-3 rounded-xl font-bold transition shadow-lg ${isEditing ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                            {isEditing ? 'Update Job Role' : 'Add Job Role'}
                        </button>
                    </form>

                    {/* Existing Jobs List */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Active Job Roles</h3>
                        {jobs.map(job => (
                            <div key={job.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition group">
                                <div>
                                    <p className="font-bold text-gray-800">{job.title} <span className="text-gray-400 text-xs font-normal">(ID: {job.id})</span></p>
                                    <p className="text-sm text-gray-500">
                                        {job.department} • {job.location} • <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">{job.type}</span>
                                        {job.category && <span className="ml-2 text-purple-600 bg-purple-50 px-2 py-0.5 rounded text-xs">{job.category}</span>}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">Posted: {new Date(job.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditJob(job)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 transition font-medium rounded-lg text-xs">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDeleteJob(job.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 transition font-medium rounded-lg text-xs">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                        {jobs.length === 0 && <p className="text-center text-gray-400 text-sm py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">No job roles active.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageJobs;
