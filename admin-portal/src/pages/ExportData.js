import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, FileText, Check, X, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ExportData = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);

    // Using environment variable or fallback to a placeholder if not set yet on frontend
    const GOOGLE_DRIVE_FOLDER_ID = "YOUR_DRIVE_FOLDER_ID_HERE";
    const GOOGLE_DRIVE_BASE_URL = `https://drive.google.com/drive/folders/${GOOGLE_DRIVE_FOLDER_ID}?usp=drive_link`;

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/admin-login');
        }
        fetchApplications();
    }, [isAuthenticated, isLoading, navigate]);

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
    }

    const handleDownloadCSV = () => {
        const headers = ["ID", "Name", "Role", "Dept", "Type", "Email", "Phone", "Location", "Resume Link", "Status", "Applied At"];
        const csvContent = [
            headers.join(","),
            ...applications.map(app => {
                const row = [
                    app.id,
                    `"${app.name}"`,
                    `"${app.job_title}"`, // Assuming job title from join
                    `"${app.department || ''}"`,
                    `"${app.type || ''}"`,
                    app.email,
                    app.phone,
                    `"${app.location || ''}"`,
                    `"${app.resume_link}"`,
                    app.status,
                    app.applied_at
                ];
                return row.join(",");
            })
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "silo_applications_export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/applications/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                fetchApplications();
                alert(`Application ${newStatus}! Email notification sent.`);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Deletion logic not in initial requirement for admin regarding "jobs"? 
    // Wait: "admin ... 'jobs' -> add and remove jobs". 
    // And for "job application" -> "shortlisted or rejected".
    // It doesn't explicitly say delete application. But for completeness I'll leave it or remove if confusing.
    // User code had delete. I'll remove it for now to match backend API strictness unless I add DELETE to backend.
    // Backend routes I created: GET, POST jobs, DELETE jobs, POST apply, GET applications, PUT status. 
    // No DELETE application route. So I will skip delete button for applications.

    const handleDownloadResume = (app) => {
        // Just open the link for now as it's a Drive link
        window.open(app.resume_link, '_blank');
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate('/admin-dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium">
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Export Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                    <Download size={24} />
                                </div>
                                <h1 className="text-xl font-bold text-gray-900">Export Data</h1>
                            </div>
                            <p className="text-gray-600 mb-6 text-sm">Download a complete CSV report of all applications. The report includes candidate details and direct links to their resumes in Drive.</p>

                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl mb-6">
                                <button onClick={handleDownloadCSV} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-200">
                                    <Download size={20} /> Download CSV
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Applications Table */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                            <th className="p-4 font-bold">Candidate</th>
                                            <th className="p-4 font-bold">Role & Status</th>
                                            <th className="p-4 font-bold">Resume</th>
                                            <th className="p-4 font-bold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {applications.map(app => (
                                            <tr key={app.id} className="hover:bg-gray-50 transition">
                                                <td className="p-4">
                                                    <p className="font-bold text-gray-900">{app.name}</p>
                                                    <p className="text-xs text-gray-500">{app.email}</p>
                                                    <p className="text-xs text-gray-400">{new Date(app.applied_at).toLocaleDateString()}</p>
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-sm font-medium text-gray-800">{app.job_title}</p>
                                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${app.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                        app.status === 'Shortlisted' ? 'bg-emerald-100 text-emerald-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <a
                                                        href={app.resume_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                                                    >
                                                        <FileText size={12} /> View File
                                                    </a>
                                                    <button onClick={() => handleDownloadResume(app)} className="text-gray-400 hover:text-gray-600 text-xs mt-1 underline block">
                                                        Download Profile
                                                    </button>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => updateStatus(app.id, 'Shortlisted')} className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100" title="Shortlist"><Check size={16} /></button>
                                                        <button onClick={() => updateStatus(app.id, 'Rejected')} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Reject"><X size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {applications.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="p-8 text-center text-gray-400 text-sm">No applications found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportData;
