import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ArrowLeft, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AgriSummit from '../assets/agri-summit.png';
import HackathonImage from '../assets/hackathon.jpg';

const AllEvents = () => {
    const navigate = useNavigate();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        ticket_count: 1
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/events');
                if (response.ok) {
                    const data = await response.json();
                    // Process events to add images (randomly or placeholder since DB doesn't have images)
                    const processedEvents = data.map(event => ({
                        ...event,
                        // Assign random image from imports or placeholder
                        image: event.title.toLowerCase().includes('hackathon') ? HackathonImage :
                            event.title.toLowerCase().includes('summit') ? AgriSummit :
                                'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=2069',
                        category: event.title.includes('Hackathon') ? 'Hackathon' : 'Event'
                    }));
                    setEvents(processedEvents);
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };
        fetchEvents();
    }, []);

    const handleRegister = (event) => {
        setSelectedEvent(event);
        setShowModal(true);
        setSuccess(false);
        setFormData({ name: '', email: '', phone: '', ticket_count: 1 });
    };

    const handleClose = () => {
        setShowModal(false);
        setSelectedEvent(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email.endsWith('@gmail.com')) {
            alert('Only @gmail.com email addresses are allowed.');
            return;
        }

        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            alert('Phone number must be exactly 10 digits.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/register-event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event_id: selectedEvent.id,
                    event_title: selectedEvent.title,
                    ...formData
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    handleClose();
                }, 3000);
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Error registering:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 font-sans">
            <div className="bg-emerald-900 text-white py-12 px-6">
                <div className="container mx-auto max-w-7xl">
                    <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-emerald-200 hover:text-white mb-6 transition">
                        <ArrowLeft size={20} /> Back to Events
                    </button>
                    <h1 className="text-4xl font-extrabold mb-4">All Upcoming Events</h1>
                    <p className="text-emerald-100 text-lg">Browse through our complete list of events, workshops, and webinars.</p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 max-w-7xl">
                {/* Search & Filter - Visual only for now */}
                <div className="flex flex-col md:flex-row gap-4 mb-10">
                    <div className="relative flex-grow max-w-md">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input type="text" placeholder="Search events..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map(event => (
                        <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                            <div className="h-48 overflow-hidden relative">
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 z-10 uppercase tracking-wider shadow-sm">
                                    {event.category}
                                </div>
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                                />
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <div className="flex items-center gap-4 text-emerald-600 text-xs font-bold mb-3">
                                    <span className="flex items-center gap-1 uppercase tracking-wide"><Calendar size={14} /> {event.date}</span>
                                    <span className="flex items-center gap-1 uppercase tracking-wide ml-auto text-emerald-700">{event.price > 0 ? `₹${event.price}` : 'Free'}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                                <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                                    <MapPin size={14} /> {event.location}
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                                    {event.description}
                                </p>
                                <button
                                    onClick={() => handleRegister(event)}
                                    className="w-full bg-emerald-50 text-emerald-700 font-bold py-2.5 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors"
                                >
                                    Register Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Registration Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>

                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Register for Event</h2>
                            <p className="text-emerald-700 font-medium mb-1">{selectedEvent?.title}</p>
                            <p className="text-gray-500 text-sm mb-6">Price per ticket: <span className="font-bold text-gray-800">₹{selectedEvent?.price > 0 ? selectedEvent.price : 'Free'}</span></p>

                            {success ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Registration Successful!</h3>
                                    <p className="text-gray-500 mt-2">A confirmation email has been sent to you.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                        <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                        <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="john@gmail.com" />
                                        <p className="text-xs text-gray-400 mt-1">Only @gmail.com allowed</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                                        <input required name="phone" value={formData.phone} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) setFormData({ ...formData, phone: val }); }} type="tel" maxLength={10} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="10-digit phone number" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Number of Tickets</label>
                                        <input required name="ticket_count" value={formData.ticket_count} onChange={handleChange} type="number" min="1" max="10" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full bg-emerald-700 text-white font-bold py-3 rounded-xl hover:bg-emerald-800 transition-colors shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? 'Registering...' : 'Confirm Registration'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllEvents;
