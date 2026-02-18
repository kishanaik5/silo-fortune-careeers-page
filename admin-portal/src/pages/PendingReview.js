import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Mail, Phone, Briefcase, ChevronDown, ChevronUp, FileText, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function PendingReview() {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedJob, setExpandedJob] = useState(null);
    const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => setToast({ open: true, message, type });
    const closeToast = () => setToast(t => ({ ...t, open: false }));

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/admin-login');
        }
        fetchApplications();
    }, [isAuthenticated, authLoading, navigate]);

    const fetchApplications = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/applications');
            if (response.ok) {
                const data = await response.json();
                const pending = data.filter(a => a.status === 'Pending');
                setApplications(pending);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:5000/api/applications/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (response.ok) {
                showToast(`Applicant ${status.toLowerCase()} successfully!`, 'success');
                fetchApplications();
            } else {
                showToast('Failed to update status.', 'error');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Error updating status.', 'error');
        }
    };

    // Group by job_title (same field as JobRoles.js)
    const grouped = applications.reduce((acc, app) => {
        const role = app.job_title || 'Unknown Role';
        if (!acc[role]) acc[role] = [];
        acc[role].push(app);
        return acc;
    }, {});

    const toggleJob = (role) => {
        setExpandedJob(expandedJob === role ? null : role);
    };

    if (isLoading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-amber-600 font-bold text-lg animate-pulse">Loading pending applications...</div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="bg-emerald-900 text-white px-6 py-4 flex items-center gap-4 shadow-lg">
                <button
                    onClick={() => navigate('/admin-dashboard')}
                    className="flex items-center gap-2 text-emerald-200 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Dashboard</span>
                </button>
                <div className="h-6 w-px bg-emerald-600" />
                <div className="flex items-center gap-2">
                    <Clock size={20} className="text-amber-400" />
                    <h1 className="text-xl font-bold">Pending Review</h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Summary Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-center gap-4">
                    <div className="bg-amber-100 p-3 rounded-xl">
                        <Clock size={28} className="text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-extrabold text-amber-700">{applications.length}</p>
                        <p className="text-amber-600 font-medium">
                            Applications awaiting review across {Object.keys(grouped).length} job role{Object.keys(grouped).length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {applications.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <Clock size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="text-xl font-semibold">No pending applications</p>
                        <p className="text-sm mt-1">All applications have been reviewed.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(grouped).map(([role, apps]) => (
                            <div key={role} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Job Role Header */}
                                <button
                                    onClick={() => toggleJob(role)}
                                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-amber-100 p-2 rounded-lg">
                                            <Briefcase size={18} className="text-amber-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900 text-lg">{role}</p>
                                            <p className="text-sm text-gray-500">{apps.length} pending applicant{apps.length !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-amber-100 text-amber-700 text-sm font-bold px-3 py-1 rounded-full">
                                            {apps.length} Pending
                                        </span>
                                        {expandedJob === role
                                            ? <ChevronUp size={20} className="text-gray-400" />
                                            : <ChevronDown size={20} className="text-gray-400" />}
                                    </div>
                                </button>

                                {/* Applicants Table */}
                                {expandedJob === role && (
                                    <div className="border-t border-gray-100 overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-sm">
                                            <thead>
                                                <tr className="text-gray-500 border-b border-gray-200 bg-gray-50">
                                                    <th className="py-3 px-4 font-medium">Name</th>
                                                    <th className="py-3 px-4 font-medium">Contact</th>
                                                    <th className="py-3 px-4 font-medium">Applied On</th>
                                                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {apps.map((app, idx) => (
                                                    <tr key={app.id} className="border-b border-gray-100 hover:bg-amber-50 transition-colors">
                                                        <td className="py-3 px-4 font-medium text-gray-900">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                                                                    {(app.name || '?').charAt(0).toUpperCase()}
                                                                </div>
                                                                {app.name}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-600">
                                                            <div className="flex items-center gap-1">
                                                                <Mail size={13} className="text-gray-400" /> {app.email}
                                                            </div>
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <Phone size={13} className="text-gray-400" /> {app.phone}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-500">
                                                            {app.applied_at
                                                                ? new Date(app.applied_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                                : 'N/A'}
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <button
                                                                onClick={() => navigate('/admin-job-roles', { state: { role: app.job_title } })}
                                                                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-xs font-semibold"
                                                                title="View in Job Roles"
                                                            >
                                                                View →
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Toast isOpen={toast.open} message={toast.message} type={toast.type} onClose={closeToast} />
        </>
    );
}
