import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle, AlertCircle, MapPin, Briefcase, Clock, ChevronRight, ChevronDown, ChevronUp, X, Calendar, Hash } from 'lucide-react';
import Toast from '../components/Toast'; // Import Toast
import { useCandidateAuth } from '../context/CandidateAuthContext';

const ApplyJob = () => {
    const { title, department, type } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Steps: 0 = Job Details, 1 = OTP Verification, 2 = Application Form, 3 = Success
    const [step, setStep] = useState(0);
    const [job, setJob] = useState(location.state?.job || null);
    const [loading, setLoading] = useState(!location.state?.job);
    const [error, setError] = useState('');

    // OTP State
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [otpTimer, setOtpTimer] = useState(0);
    const [canResend, setCanResend] = useState(true); // New state for Resend button

    // Form State
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        location: '',
        pincode: '', // Added Pincode
        qualification: '',
        gender: '',
        linkedin: '',
        portfolio: '',
        address: '', // Current Address
        tech_stack: '',
        projects_github: '',
        applicant_experience: '', // Will be dropdown
        current_salary: '',
        expected_salary: '',
        joining_date: '',
        cover_letter: null, // Now a file
        resume: null,
        acknowledgement: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [acknowledgementError, setAcknowledgementError] = useState(false); // Glassy error state

    // Notification State
    const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type = 'error') => {
        setNotification({ message, type });
    };

    const closeNotification = () => {
        setNotification({ message: '', type: '' });
    };

    // Accordion State: 0 = Personal, 1 = Professional, 2 = Links
    const [openSection, setOpenSection] = useState(0);

    // Regex Patterns
    const LINKEDIN_REGEX = /^https:\/\/(www\.)?linkedin\.com\/.*$/;
    const GITHUB_REGEX = /^https:\/\/(www\.)?github\.com\/.*$/;

    const { user } = useCandidateAuth();

    useEffect(() => {
        // If user logs in (e.g. after redirect), we don't auto-advance. 
        // We wait for them to click Apply again, or we could auto-check.
        // Let's stick to manual click for clarity, or maybe auto-check if they just came back?
        // For now, let's keep it simple: User sees JD, clicks Apply -> Checks.
    }, [user]);

    useEffect(() => {
        if (!job) {
            const fetchJob = async () => {
                try {
                    const response = await fetch('http://localhost:5000/api/jobs');
                    if (response.ok) {
                        const jobs = await response.json();
                        const foundJob = jobs.find(j =>
                            j.title === decodeURIComponent(title) &&
                            j.department === decodeURIComponent(department) &&
                            j.type === decodeURIComponent(type)
                        );
                        if (foundJob) {
                            setJob(foundJob);
                        } else {
                            setError('Job not found');
                        }
                    }
                } catch (err) {
                    console.error('Error fetching job details:', err);
                    setError('Failed to load job details');
                } finally {
                    setLoading(false);
                }
            };
            fetchJob();
        }
    }, [title, department, type, job]);

    useEffect(() => {
        if (otpTimer > 0) {
            const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [otpTimer]);

    // --- HANDLERS ---

    const handleSendOtp = async () => {
        if (!email) {
            setOtpError('Please enter your email first.');
            return;
        }
        if (!email.endsWith('@gmail.com')) {
            setOtpError('Only @gmail.com addresses are allowed.');
            return;
        }
        if (!canResend) return;

        setCanResend(false); // Disable immediately
        try {
            const response = await fetch('http://localhost:5000/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (response.ok) {
                setIsOtpSent(true);
                setOtpError('');
                setOtpTimer(60); // 60s cooldown
            } else {
                setOtpError('Failed to send OTP. Please try again.');
                setCanResend(true); // Re-enable on failure
            }
        } catch (err) {
            console.error(err);
            setOtpError('Network error sending OTP.');
            setCanResend(true);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });

            if (!response.ok) {
                setOtpError('Invalid OTP. Please try again.');
                return;
            }

            const checkResponse = await fetch('http://localhost:5000/api/check-application', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, jobId: job.id })
            });

            if (checkResponse.ok) {
                const checkData = await checkResponse.json();
                if (checkData.exists) {
                    showNotification('You have already applied for this job! We are reviewing your profile.', 'error');
                    return;
                }
            }

            setIsVerified(true);
            setOtpError('');
            setStep(2);

        } catch (err) {
            console.error(err);
            setOtpError('Network error verifying OTP.');
        }
    };

    const validateExperienceInput = (inputExp) => {
        if (!job.experience) return true;
        const exp = parseFloat(inputExp);
        if (isNaN(exp)) return false;

        const req = job.experience.toLowerCase();
        if (req.includes('fresher')) return exp >= 0 && exp <= 1;
        if (req.includes('junior')) return exp >= 1 && exp <= 3;
        if (req.includes('mid-level')) return exp >= 3 && exp <= 5;
        if (req.includes('senior')) return exp >= 5;
        return true;
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        // Handle Files
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // --- VALIDATION HELPERS ---
    const isPersonalValid = () => {
        // Address is NOT mandatory anymore. Pincode is NEW mandatory (implied? "In personal details add Pincode field" - usually address parts are mandatory if address was).
        // Let's assume Pincode is mandatory for now, but Address is NOT.
        // Resume moved here.
        return formData.first_name && formData.last_name && formData.gender &&
            formData.phone && /^\d{10}$/.test(formData.phone) &&
            formData.location && formData.pincode && formData.resume;
    };

    const isProfessionalValid = () => {
        // Expected Salary & Joining Date -> REMOVE Mandatory
        // Tech Stack -> implied mandatory? 
        // Let's keep Qualification, Experience, Current Salary, Tech Stack as mandatory.
        // Let's keep Qualification, Experience, Current Salary, Tech Stack as mandatory.
        const isExpValid = formData.applicant_experience && validateExperienceInput(formData.applicant_experience);
        return formData.qualification && isExpValid &&
            formData.current_salary && formData.tech_stack;
    };

    const isLinksValid = () => {
        // Cover Letter is MANDATORY (File now)
        // LinkedIn / GitHub -> Optional but MUST match regex if present
        const linkedinValid = !formData.linkedin || LINKEDIN_REGEX.test(formData.linkedin);
        const githubValid = !formData.projects_github || GITHUB_REGEX.test(formData.projects_github);

        return formData.cover_letter && linkedinValid && githubValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAcknowledgementError(false);

        if (!formData.acknowledgement) {
            setAcknowledgementError(true);
            // Scroll to bottom?
            return;
        }

        if (!isPersonalValid() || !isProfessionalValid() || !isLinksValid()) {
            showNotification('Please fill in all mandatory fields correctly.', 'error');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const data = new FormData();
        data.append('jobId', job.id);
        data.append('role', job.title);
        data.append('email', email);

        Object.keys(formData).forEach(key => {
            if (key === 'resume' || key === 'cover_letter') {
                if (formData[key]) data.append(key, formData[key]);
            } else {
                data.append(key, formData[key]);
            }
        });

        try {
            const response = await fetch('http://localhost:5000/api/apply', {
                method: 'POST',
                body: data
            });

            if (response.ok) {
                setStep(3);
            } else {
                const errData = await response.json();
                showNotification(errData.error || 'Failed to submit application', 'error');
            }
        } catch (err) {
            console.error('Submission error:', err);
            showNotification('Network error. Please try again later.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSection = (index) => {
        setOpenSection(openSection === index ? -1 : index);
    };

    // Helper to render section status dot
    const StatusDot = ({ isValid }) => (
        <div className={`w-3 h-3 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;

    if (!job) return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="text-center">
                <h2 className="text-xl font-bold text-red-600 mb-4">Job Not Found</h2>
                <button onClick={() => navigate('/jobs')} className="px-6 py-2 bg-emerald-600 text-white rounded-lg">Browse Jobs</button>
            </div>
        </div>
    );

    // --- VIEWS ---

    if (step === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-emerald-900 p-8 text-white">
                        <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                        <div className="flex flex-wrap gap-4 text-emerald-100 mt-4">
                            <span className="flex items-center gap-1"><Briefcase size={18} /> {job.department}</span>
                            <span className="flex items-center gap-1"><MapPin size={18} /> {job.location}</span>
                            <span className="flex items-center gap-1"><Clock size={18} /> {job.type}</span>
                            <span className="flex items-center gap-1"><Hash size={18} /> ID: {job.id}</span>
                            <span className="flex items-center gap-1"><Calendar size={18} /> Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="p-8 space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Job Description</h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Requirements</h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
                        </div>
                        {job.experience && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Experience Required</h3>
                                <p className="text-gray-700">{job.experience}</p>
                            </div>
                        )}
                        <div className="flex justify-end pt-6">
                            <button
                                onClick={async () => {
                                    if (!user) {
                                        navigate('/login', { state: { from: location } });
                                        return;
                                    }

                                    try {
                                        const response = await fetch('http://localhost:5000/api/check-application', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ email: user.email, jobId: job.id })
                                        });
                                        const data = await response.json();

                                        if (data.exists) {
                                            showNotification('You have already applied for this position.', 'error');
                                        } else {
                                            setEmail(user.email);
                                            setIsVerified(true);
                                            setStep(2);
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        showNotification('Error checking application status', 'error');
                                    }
                                }}
                                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition flex items-center gap-2 shadow-lg hover:shadow-emerald-200"
                            >
                                Apply Now <ChevronRight size={20} />
                            </button>
                        </div>
                        <Toast
                            message={notification.message}
                            type={notification.type}
                            onClose={closeNotification}
                        />
                    </div>
                </div>
            </div >
        );
    }

    if (step === 1) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 pt-20">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 animate-fade-in relative">
                    <button onClick={() => setStep(0)} className="absolute top-6 left-6 text-gray-400 hover:text-gray-600"><ArrowLeft size={24} /></button>
                    <div className="text-center mb-8 mt-4">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
                        <p className="text-gray-500 mt-2">To proceed with your application for <span className="font-semibold text-emerald-700">{job.title}</span>, please verify your email address.</p>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                            <div className="flex gap-2">
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" disabled={isOtpSent} />
                                <button onClick={handleSendOtp} disabled={!email || (isOtpSent && otpTimer > 0)} className="px-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap">
                                    {isOtpSent ? (otpTimer > 0 ? `${otpTimer}s` : 'Resend') : 'Send OTP'}
                                </button>
                            </div>
                        </div>
                        {isOtpSent && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Enter OTP</label>
                                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none tracking-widest text-center text-lg font-bold" />
                                <button onClick={handleVerifyOtp} className="w-full mt-6 py-3 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 shadow-lg">Verify & Continue</button>
                            </div>
                        )}
                        {otpError && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center font-medium">{otpError}</div>}
                        <Toast
                            message={notification.message}
                            type={notification.type}
                            onClose={closeNotification}
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (step === 2) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-emerald-900 p-6 text-white flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Application Form</h2>
                            <p className="text-emerald-200 text-sm">Applying for {job.title} (ID: {job.id})</p>
                        </div>
                        <div className="text-right text-xs opacity-70">
                            Verified Email:<br />{email}
                        </div>
                    </div>

                    <div className="flex justify-center mt-8">
                        {step === 1 && (
                            <div className="text-center w-full max-w-md">
                                {/* Helper Notification for OTP Error if needed, though inline is also fine. Let's keep inline for OTP context unless User wants all errors. User said "where ever the error messages will come". Let's hook setOtpError to showNotification too? Or just use Toast for major alerts. The "alert" box is the main target. */}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center mt-8">
                        {step === 1 && (
                            <div className="text-center w-full max-w-md">
                                {/* Helper Notification for OTP Error if needed */}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <Toast
                            message={notification.message}
                            type={notification.type}
                            onClose={closeNotification}
                        />

                        {/* Section 0: Resume Upload */}
                        <div className="mb-4 border border-gray-200 rounded-xl overflow-hidden bg-white">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                                <StatusDot isValid={formData.resume} />
                                <span className="font-bold text-gray-800">Resume / CV</span>
                            </div>
                            <div className="p-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Resume (PDF/DOC) <span className="text-red-500">*</span></label>
                                <input required type="file" accept=".pdf,.doc,.docx" name="resume" onChange={handleFormChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                            </div>
                        </div>

                        {/* Section 1: Personal Details */}
                        <div className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
                            <button type="button" onClick={() => toggleSection(0)} className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition">
                                <div className="flex items-center gap-3">
                                    <StatusDot isValid={isPersonalValid()} />
                                    <span className="font-bold text-gray-800">Personal Details</span>
                                </div>
                                {openSection === 0 ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                            </button>

                            {openSection === 0 && (
                                <div className="p-6 bg-white animate-fade-in border-t border-gray-200">

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                                            <input required name="first_name" value={formData.first_name} onChange={handleFormChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                                            <input required name="last_name" value={formData.last_name} onChange={handleFormChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
                                            <select required name="gender" value={formData.gender} onChange={handleFormChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number (10 digits) <span className="text-red-500">*</span></label>
                                            <input required type="tel" name="phone" value={formData.phone} onChange={handleFormChange} className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${formData.phone && !/^\d{10}$/.test(formData.phone) ? 'border-red-500 bg-red-50' : ''}`} placeholder="9876543210" />
                                            {formData.phone && !/^\d{10}$/.test(formData.phone) && <p className="text-red-500 text-xs mt-1">Must be exactly 10 digits</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Current Address</label>
                                            <textarea name="address" rows="2" value={formData.address} onChange={handleFormChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none" placeholder="Full residential address (Optional)"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">City/Location <span className="text-red-500">*</span></label>
                                            <input required name="location" value={formData.location} onChange={handleFormChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Bangalore, India" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Pincode <span className="text-red-500">*</span></label>
                                            <input required name="pincode" value={formData.pincode} onChange={handleFormChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 560001" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-6">
                                        <button type="button" onClick={() => setOpenSection(1)} className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition">Next Section</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 2: Professional Details */}
                        <div className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
                            <button type="button" onClick={() => toggleSection(1)} className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition">
                                <div className="flex items-center gap-3">
                                    <StatusDot isValid={isProfessionalValid()} />
                                    <span className="font-bold text-gray-800">Professional Details</span>
                                </div>
                                {openSection === 1 ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                            </button>

                            {openSection === 1 && (
                                <div className="p-6 bg-white animate-fade-in border-t border-gray-200">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Qualification <span className="text-red-500">*</span></label>
                                            <input required name="qualification" value={formData.qualification} onChange={handleFormChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. B.Tech CS" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Total Experience (Years) <span className="text-red-500">*</span></label>
                                            <input
                                                required
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                name="applicant_experience"
                                                value={formData.applicant_experience}
                                                // onChange does real-time validation, which is fine if empty at start.
                                                onChange={handleFormChange}
                                                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${formData.applicant_experience && !validateExperienceInput(formData.applicant_experience) ? 'border-red-500 bg-red-50' : ''}`}
                                                placeholder="e.g. 2.5"
                                            />
                                            {formData.applicant_experience && !validateExperienceInput(formData.applicant_experience) && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    Experience does not match the job requirement: {job.experience}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Current Salary (LPA) <span className="text-red-500">*</span></label>
                                            <input required name="current_salary" value={formData.current_salary} onChange={handleFormChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Expected Salary (LPA)</label>
                                            <input name="expected_salary" value={formData.expected_salary} onChange={handleFormChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Optional" />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Expected Joining Date</label>
                                        <input type="text" name="joining_date" value={formData.joining_date} onChange={handleFormChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Immediately or 30 days" />
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tech Stack / Skills <span className="text-red-500">*</span></label>
                                        <textarea required name="tech_stack" rows="3" value={formData.tech_stack} onChange={handleFormChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none" placeholder="List your technical skills separated by commas"></textarea>
                                    </div>
                                    <div className="flex justify-end mt-6">
                                        <button type="button" onClick={() => setOpenSection(2)} className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition">Next Section</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 3: Links & Documents */}
                        <div className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
                            <button type="button" onClick={() => toggleSection(2)} className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition">
                                <div className="flex items-center gap-3">
                                    <StatusDot isValid={isLinksValid()} />
                                    <span className="font-bold text-gray-800">Links & Documents</span>
                                </div>
                                {openSection === 2 ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                            </button>

                            {openSection === 2 && (
                                <div className="p-6 bg-white animate-fade-in border-t border-gray-200">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">LinkedIn Profile</label>
                                            <input type="url" name="linkedin" value={formData.linkedin} onChange={handleFormChange} className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${formData.linkedin && !LINKEDIN_REGEX.test(formData.linkedin) ? 'border-red-500 bg-red-50' : ''}`} placeholder="https://linkedin.com/in/..." />
                                            {formData.linkedin && !LINKEDIN_REGEX.test(formData.linkedin) && <p className="text-red-500 text-xs mt-1">Invalid LinkedIn URL format</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Portfolio / Website</label>
                                            <input type="url" name="portfolio" value={formData.portfolio} onChange={handleFormChange} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://..." />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">GitHub Projects</label>
                                        <textarea name="projects_github" rows="2" value={formData.projects_github} onChange={handleFormChange} className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none ${formData.projects_github && !GITHUB_REGEX.test(formData.projects_github) ? 'border-red-500 bg-red-50' : ''}`} placeholder="Links to your best projects"></textarea>
                                        {formData.projects_github && !GITHUB_REGEX.test(formData.projects_github) && <p className="text-red-500 text-xs mt-1">Invalid GitHub URL format</p>}
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Cover Letter (PDF) <span className="text-red-500">*</span></label>
                                        {/* Changed to File Upload */}
                                        <input required type="file" accept=".pdf" name="cover_letter" onChange={handleFormChange} className="w-full p-3 border border-gray-200 rounded-xl" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Acknowledgment */}
                        <div className="pt-4">
                            <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl transition border ${acknowledgementError ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] backdrop-blur-md animate-pulse' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}>
                                <input
                                    type="checkbox"
                                    name="acknowledgement"
                                    checked={formData.acknowledgement}
                                    onChange={handleFormChange}
                                    className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                                />
                                <span className="text-sm text-gray-600">
                                    I hereby acknowledge that all the information provided above is correct and true to the best of my knowledge. I understand that any false information may lead to disqualification.
                                </span>
                            </label>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-2 mt-4 font-medium">
                                <AlertCircle size={20} /> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full mt-6 py-4 bg-emerald-900 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-800 transition ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                        </button>
                    </form>
                </div >
            </div >
        );
    }

    if (step === 3) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-fade-in">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for applying to <strong>{job.title}</strong>. We have sent a confirmation email to <strong>{email}</strong>. Our team will review your profile and get back to you soon.
                    </p>
                    <button onClick={() => navigate('/jobs')} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition">
                        Back to Careers
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default ApplyJob;
