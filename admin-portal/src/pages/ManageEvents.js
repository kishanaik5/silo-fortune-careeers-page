import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Ticket, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

const ManageEvents = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [confirm, setConfirm] = useState({ open: false, type: '', id: null });
    const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => setToast({ open: true, message, type });
    const closeToast = () => setToast(t => ({ ...t, open: false }));

    // Form State
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        location: '',
        total_tickets: '',
        price: '',
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

    const resetForm = () => {
        setFormData({ title: '', date: '', location: '', total_tickets: '', price: '', description: '' });
        setEditMode(false);
        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editMode
            ? `http://localhost:5000/api/events/${editingId}`
            : 'http://localhost:5000/api/events';
        const method = editMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast(`Event ${editMode ? 'updated' : 'created'} successfully!`, 'success');
                resetForm();
                fetchEvents();
            } else {
                showToast(`Failed to ${editMode ? 'update' : 'create'} event.`, 'error');
            }
        } catch (error) {
            console.error(`Error ${editMode ? 'updating' : 'creating'} event:`, error);
            showToast(`Error ${editMode ? 'updating' : 'creating'} event.`, 'error');
        }
    };

    const handleEditClick = (event) => {
        setFormData({
            title: event.title,
            date: event.date,
            location: event.location,
            total_tickets: event.total_tickets,
            price: event.price,
            description: event.description
        });
        setEditingId(event.id);
        setEditMode(true);
        setShowForm(true);
    };

    const handleDeleteClick = (id) => {
        setConfirm({ open: true, type: 'delete', id });
    };

    const doDeleteEvent = async () => {
        const { id } = confirm;
        setConfirm({ open: false, type: '', id: null });
        try {
            const response = await fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showToast('Event deleted successfully!', 'success');
                fetchEvents();
            } else {
                showToast('Failed to delete event.', 'error');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleMarkDone = (id) => {
        setConfirm({ open: true, type: 'done', id });
    };

    const doMarkDone = async () => {
        const { id } = confirm;
        setConfirm({ open: false, type: '', id: null });
        try {
            const response = await fetch(`http://localhost:5000/api/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Done' })
            });
            if (response.ok) {
                fetchEvents();
            } else {
                showToast('Failed to update status.', 'error');
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading events...</div>;

    return (
        <>
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate('/admin-dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium">
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
                        <p className="text-gray-500 mt-1">Create and manage upcoming events and ticket limits.</p>
                    </div>
                    <button onClick={() => { resetForm(); setShowForm(true); }} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg flex items-center gap-2">
                        <Plus size={20} /> Create New Event
                    </button>
                </div>

                {/* Create/Edit Event Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-fade-in-up">
                            <h2 className="text-2xl font-bold mb-6">{editMode ? 'Edit Event' : 'Create New Event'}</h2>
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
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Registration Fee</label>
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
                                    <button type="button" onClick={resetForm} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg">
                                        {editMode ? 'Update Event' : 'Create Event'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Events List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <div key={event.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition relative ${event.status === 'Done' ? 'opacity-75' : ''}`}>
                            {event.status === 'Done' && (
                                <div className="absolute top-4 right-4 bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                                    Done
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${event.status === 'Done' ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-600'}`}>
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
                                    <span className="font-bold mr-2 text-emerald-600">{event.price ? `₹${event.price}` : 'Free'}</span>
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
                                        className={`h-2 rounded-full transition-all duration-500 ${event.status === 'Done' ? 'bg-gray-400' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min(((event.registered_count / event.total_tickets) * 100), 100)}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-400 text-right mt-1">
                                    {event.registered_count} Registered
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleEditClick(event)}
                                        className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(event.id)}
                                        className="py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    {event.status !== 'Done' && (
                                        <button
                                            onClick={() => handleMarkDone(event.id)}
                                            className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200"
                                        >
                                            Mark Done
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ConfirmModal
                isOpen={confirm.open}
                title={confirm.type === 'delete' ? 'Delete Event' : 'Mark as Done'}
                message={confirm.type === 'delete'
                    ? 'Are you sure you want to delete this event? This action cannot be undone.'
                    : 'Mark this event as done? This cannot be reversed.'}
                confirmText={confirm.type === 'delete' ? 'Delete' : 'Mark Done'}
                type={confirm.type === 'delete' ? 'danger' : 'warning'}
                onConfirm={confirm.type === 'delete' ? doDeleteEvent : doMarkDone}
                onCancel={() => setConfirm({ open: false, type: '', id: null })}
            />
            <Toast isOpen={toast.open} message={toast.message} type={toast.type} onClose={closeToast} />
        </>
    );
};

export default ManageEvents;
