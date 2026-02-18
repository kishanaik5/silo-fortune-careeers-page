import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Users, Check, X, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const JobRoles = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [applications, setApplications] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/admin-login');
        }
        fetchApplications();
    }, [isAuthenticated, isLoading, navigate]);

    // Auto-select role if navigated from PendingReview
    useEffect(() => {
        if (location.state?.role) {
            setSelectedRole(location.state.role);
        }
    }, [location.state]);

    const fetchApplications = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/applications');
            if (response.ok) {
                const data = await response.json();
                setApplications(data);
                // Extract unique roles
                const uniqueRoles = [...new Set(data.map(app => app.job_title))];
                setRoles(uniqueRoles);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this applicant?`)) return;

        try {
            const response = await fetch(`http://localhost:5000/api/applications/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                alert(`Applicant ${status.toLowerCase()} successfully!`);
                fetchApplications(); // Refresh data
            } else {
                alert('Failed to update status.');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status.');
        }
    };

    const handleDownloadCSV = (role) => {
        const roleApps = applications.filter(app => app.job_title === role);
        const headers = ["ID", "Name", "Role", "Email", "Phone", "Location", "Resume Link", "Status", "Applied At"];

        const csvContent = [
            headers.join(","),
            ...roleApps.map(app => {
                const row = [
                    app.id,
                    `"${app.name}"`,
                    `"${app.job_title}"`,
                    app.email,
                    app.phone,
                    `"${app.location || ''}"`,
                    `"${app.resume_link}"`,
                    app.status,
                    new Date(app.applied_at).toLocaleString()
                ];
                return row.join(",");
            })
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${role.replace(/\s+/g, '_')}_applicants.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) return <div>Loading...</div>;

    // Filter applicants for the selected role
    const filteredApplications = selectedRole
        ? applications.filter(app => app.job_title === selectedRole)
        : [];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => selectedRole ? setSelectedRole(null) : navigate('/admin-dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
                >
                    <ArrowLeft size={20} /> {selectedRole ? 'Back to Roles' : 'Back to Dashboard'}
                </button>

                {!selectedRole ? (
                    // Role Selection View
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <Users size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Job Roles</h1>
                                <p className="text-gray-500">Select a role to view applicants or download details.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {roles.map(role => (
                                <div
                                    key={role}
                                    className="p-6 bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-200 rounded-2xl transition-all shadow-sm hover:shadow-md group text-left relative"
                                >
                                    <h3
                                        className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition cursor-pointer"
                                        onClick={() => setSelectedRole(role)}
                                    >
                                        {role}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">{applications.filter(a => a.job_title === role).length} Applicants</p>

                                    <div className="flex items-center justify-between mt-4 border-t pt-4 border-gray-200">
                                        <button
                                            onClick={() => setSelectedRole(role)}
                                            className="text-sm text-blue-600 font-medium hover:underline"
                                        >
                                            View Applicants
                                        </button>
                                        <button
                                            onClick={() => handleDownloadCSV(role)}
                                            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-xs"
                                        >
                                            <Download size={14} /> CSV
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {roles.length === 0 && <p className="text-center text-gray-500 py-12">No applications found with job roles.</p>}
                    </div>
                ) : (
                    // Applicants Table View
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">{selectedRole} Applicants</h2>
                            <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-medium">
                                {filteredApplications.length} Candidates
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-gray-500 border-b border-gray-200">
                                        <th className="py-3 px-4 font-medium">Name</th>
                                        <th className="py-3 px-4 font-medium">Contact</th>
                                        <th className="py-3 px-4 font-medium">Resume</th>
                                        <th className="py-3 px-4 font-medium">Status</th>
                                        <th className="py-3 px-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredApplications.map(app => (
                                        <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium text-gray-900">{app.name}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                <div>{app.email}</div>
                                                <div>{app.phone}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <a
                                                    href={app.resume_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                                                >
                                                    <FileText size={16} /> View
                                                </a>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${app.status === 'Shortlisted' ? 'bg-green-100 text-green-700' :
                                                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {app.status === 'Pending' ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(app.id, 'Shortlisted')}
                                                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                                                                title="Shortlist"
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                                                title="Reject"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Action taken</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredApplications.length === 0 && (
                                <p className="text-center text-gray-500 py-8">No applicants found for this role.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobRoles;
