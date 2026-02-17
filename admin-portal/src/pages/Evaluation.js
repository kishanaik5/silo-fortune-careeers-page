import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Evaluation = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [editingId, setEditingId] = useState(null);

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
                // Filter only Shortlisted candidates
                setApplications(data.filter(app => app.status === 'Shortlisted'));
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const handleInputChange = (id, field, value) => {
        setApplications(apps => apps.map(app =>
            app.id === id ? { ...app, [field]: value } : app
        ));
    };

    const saveChanges = async (app) => {
        try {
            await fetch(`http://localhost:5000/api/applications/${app.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    technical_round: app.technical_round,
                    hr_round: app.hr_round,
                    fta_round: app.fta_round
                })
            });
            setEditingId(null);
            alert('Details saved successfully!');
        } catch (error) {
            console.error('Error saving changes:', error);
        }
    };

    const updateStatus = async (id, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this candidate as ${newStatus}?`)) return;

        try {
            const response = await fetch(`http://localhost:5000/api/applications/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                // If status changed to Selected or Rejected, remove from this list
                setApplications(apps => apps.filter(app => app.id !== id));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <button onClick={() => navigate('/admin-dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium">
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 bg-emerald-50">
                        <h1 className="text-2xl font-bold text-gray-900">Evaluation Sheet</h1>
                        <p className="text-emerald-700">Manage shortlisted candidates and track interview progress.</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-emerald-100 text-emerald-800 text-xs uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="p-4">Candidate</th>
                                    <th className="p-4">Technical Round</th>
                                    <th className="p-4">HR Round</th>
                                    <th className="p-4">FTA Round</th>
                                    <th className="p-4 text-center">Actions</th>
                                    <th className="p-4 text-right">Decision</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {applications.map(app => (
                                    <tr key={app.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4">
                                            <p className="font-bold text-gray-900">{app.name}</p>
                                            <p className="text-xs text-gray-500">{app.job_title}</p>
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                value={app.technical_round || ''}
                                                onChange={(e) => handleInputChange(app.id, 'technical_round', e.target.value)}
                                                placeholder="Score/Notes"
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                value={app.hr_round || ''}
                                                onChange={(e) => handleInputChange(app.id, 'hr_round', e.target.value)}
                                                placeholder="Score/Notes"
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                value={app.fta_round || ''}
                                                onChange={(e) => handleInputChange(app.id, 'fta_round', e.target.value)}
                                                placeholder="Score/Notes"
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                            />
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => saveChanges(app)}
                                                className="p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition"
                                                title="Save Details"
                                            >
                                                <Save size={18} />
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <select
                                                onChange={(e) => updateStatus(app.id, e.target.value)}
                                                value={app.status}
                                                className="p-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                                            >
                                                <option value="Shortlisted" disabled>Select Decision</option>
                                                <option value="Selected">Selected</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                                {applications.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-400">No shortlisted candidates found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Evaluation;
