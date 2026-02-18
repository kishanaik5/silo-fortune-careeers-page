import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, User } from 'lucide-react';
import { useCandidateAuth } from '../context/CandidateAuthContext';
import Toast from '../components/Toast';

const CandidateLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, user } = useCandidateAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            // Redirect to where they came from or home
            const from = location.state?.from?.pathname || '/jobs';
            navigate(from, { replace: true });
        }
    }, [user, navigate, location]);

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [otpSent, setOtpSent] = useState(false);

    const showNotification = (message, type = 'error') => {
        setNotification({ message, type });
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();

        // Strict Gmail Validation
        if (!email.endsWith('@gmail.com')) {
            showNotification('Only @gmail.com addresses are allowed.', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/candidate/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setOtpSent(true);
                setStep(2);
                showNotification('OTP sent to your email.', 'success');
            } else {
                showNotification(data.error || 'Failed to send OTP', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Network error. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/candidate/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });

            const data = await response.json();

            if (response.ok) {
                login(data.candidate);
                // Redirect handled by useEffect
            } else {
                showNotification(data.error || 'Invalid OTP', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Network error. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <Toast
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: '', type: '' })}
            />
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full flex flex-col animate-fade-in-up">
                <div className="bg-emerald-800 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-300">
                        <User size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white relative z-10">Candidate Portal</h2>
                    <p className="text-emerald-200 text-sm relative z-10">Access your profile and track applications</p>
                </div>

                <div className="p-8">

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-gray-900"
                                        placeholder="yourname@gmail.com"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Only @gmail.com accounts are accepted.</p>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 ${loading ? 'opacity-70' : ''}`}
                            >
                                {loading ? 'Sending...' : <>Continue <ArrowRight size={20} /></>}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-600">Enter OTP sent to <span className="font-semibold">{email}</span></p>
                                <button type="button" onClick={() => setStep(1)} className="text-xs text-emerald-600 hover:underline mt-1">Change Email</button>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">One-Time Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-gray-900 tracking-widest text-lg font-bold"
                                        placeholder="••••••"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 ${loading ? 'opacity-70' : ''}`}
                            >
                                {loading ? 'Verifying...' : 'Login'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center pb-2">
                        <a href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← Back to Website</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateLogin;
