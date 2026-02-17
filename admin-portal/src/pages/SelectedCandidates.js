import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SelectedCandidates = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);

    // Modal State
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

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
                // Filter only Selected candidates
                setApplications(data.filter(app => app.status === 'Selected'));
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const openEmailModal = (app) => {
        setSelectedApplicant(app);
        setEmailSubject('Congratulations! You have been selected');
        setEmailBody(`Dear ${app.name},\n\nWe are pleased to inform you that you have been selected for the position of ${app.job_title}.\n\nOur HR team will send the offer letter shortly.\n\nBest regards,\nSilo Fortune HR`);
        setShowEmailModal(true);
    };

    const sendSelectedEmail = async () => {
        if (!selectedApplicant) return;

        try {
            const response = await fetch(`http://localhost:5000/api/applications/${selectedApplicant.id}/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'selected',
                    subject: emailSubject,
                    body: emailBody
                })
            });

            if (response.ok) {
                setShowEmailModal(false);
                setSelectedApplicant(null);
                alert('Offer email sent successfully!');
            } else {
                const errorData = await response.json();
                alert(`Failed to send email: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert(`Error sending email: ${error.message}`);
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8 relative">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate('/admin-dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium">
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 bg-amber-50">
                        <h1 className="text-2xl font-bold text-gray-900">Selected Candidates</h1>
                        <p className="text-amber-700">Candidates ready for onboarding. Send offer letters from here.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                        {applications.map(app => (
                            <div key={app.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition bg-white relative">
                                <span className="absolute top-4 right-4 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Selected</span>
                                <h3 className="font-bold text-lg text-gray-900 mb-1">{app.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{app.job_title}</p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail size={16} /> {app.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone size={16} /> {app.phone}
                                    </div>
                                </div>

                                <button
                                    onClick={() => openEmailModal(app)}
                                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition"
                                >
                                    <Send size={18} /> Send Offer Email
                                </button>
                            </div>
                        ))}
                        {applications.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-400">
                                No selected candidates found.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Email Composition Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-900">Compose Offer Email</h3>
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                                <input
                                    type="text"
                                    value={selectedApplicant?.email}
                                    disabled
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="Email Subject"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition h-48 resize-none"
                                    placeholder="Write your email here..."
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={sendSelectedEmail}
                                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200"
                            >
                                <Send size={18} /> Send Application
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectedCandidates;
