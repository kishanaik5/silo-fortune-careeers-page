import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Ticket, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ManageEvents = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        location: '',
        total_tickets: '',
        price: '', // Added Price
        description: ''
    });

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/admin-login');
        }
        fetchEvents();
    }, [isAuthenticated, isLoading, navigate]);

    const fetchEvents = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/events');
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Event created successfully!');
                setShowForm(false);
                setFormData({ title: '', date: '', location: '', total_tickets: '', price: '', description: '' });
                fetchEvents();
            } else {
                alert('Failed to create event.');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Error creating event.');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading events...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate('/admin-dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium">
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
                        <p className="text-gray-500 mt-1">Create and manage upcoming events and ticket limits.</p>
                    </div>
                    <button onClick={() => setShowForm(true)} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg flex items-center gap-2">
                        <Plus size={20} /> Create New Event
                    </button>
                </div>

                {/* Create Event Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-fade-in-up">
                            <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Event Title</label>
                                    <input required name="title" value={formData.title} onChange={handleInputChange} className="w-full p-3 border rounded-xl" placeholder="e.g. Annual Hackathon 2026" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                                        <input required name="date" type="date" value={formData.date} onChange={handleInputChange} className="w-full p-3 border rounded-xl" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Total Tickets</label>
                                        <input required name="total_tickets" type="number" min="1" value={formData.total_tickets} onChange={handleInputChange} className="w-full p-3 border rounded-xl" placeholder="e.g. 100" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Registration Fee (₹)</label>
                                        <input required name="price" type="number" min="0" value={formData.price} onChange={handleInputChange} className="w-full p-3 border rounded-xl" placeholder="e.g. 500 (Enter 0 for Free)" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                                    <input required name="location" value={formData.location} onChange={handleInputChange} className="w-full p-3 border rounded-xl" placeholder="e.g. Tech Park, Bengaluru / Online" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                    <textarea required name="description" value={formData.description} onChange={handleInputChange} className="w-full p-3 border rounded-xl h-24" placeholder="Event details..." />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg">Create Event</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Events List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                                    <Calendar size={24} />
                                </div>
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                                    {event.date}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>

                            <div className="space-y-3 pt-4 border-t border-gray-50">
                                <div className="flex items-center text-sm text-gray-600">
                                    <MapPin size={16} className="mr-2 text-emerald-500" /> {event.location}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="font-bold mr-2 text-emerald-600">₹{event.price || 'Free'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <Ticket size={16} className="mr-2 text-emerald-500" />
                                        <span>{event.total_tickets} Tickets Total</span>
                                    </div>
                                    <span className={`font-bold ${event.total_tickets - event.registered_count > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {event.total_tickets - event.registered_count} Left
                                    </span>
                                </div>
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(((event.registered_count / event.total_tickets) * 100), 100)}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-400 text-right mt-1">
                                    {event.registered_count} Registered
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManageEvents;
