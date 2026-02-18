import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Mail, Phone, Ticket, Users, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EventRegistrations = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    // "Events" list from /api/events (Summary View)
    const [events, setEvents] = useState([]);

    // "Registrations" list from /api/event-registrations (Detailed View)
    const [allRegistrations, setAllRegistrations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/admin-login');
        }
        fetchData();
    }, [isAuthenticated, isLoading, navigate]);

    const fetchData = async () => {
        try {
            // Fetch Events Summary
            const eventsRes = await fetch('http://localhost:5000/api/events');
            if (eventsRes.ok) {
                const eventsData = await eventsRes.json();
                setEvents(eventsData);
            }

            // Fetch All Registrations (for detailed view filtering)
            // Optimization: Could fetch only for selected event on demand, but this is fine for now.
            const regRes = await fetch('http://localhost:5000/api/event-registrations');
            if (regRes.ok) {
                const regData = await regRes.json();
                setAllRegistrations(regData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter registrations for the selected event
    const displayedRegistrations = selectedEvent
        ? allRegistrations.filter(r => r.event_title === selectedEvent.title || r.event_id === selectedEvent.id)
        : [];

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading registrations...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <button onClick={() => selectedEvent ? setSelectedEvent(null) : navigate('/admin-dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium">
                    <ArrowLeft size={20} /> {selectedEvent ? 'Back to Events' : 'Back to Dashboard'}
                </button>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 bg-emerald-900 text-white">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-xl">
                                <Calendar size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{selectedEvent ? selectedEvent.title : 'Event Registrations'}</h1>
                                <p className="text-emerald-100 opacity-80">
                                    {selectedEvent
                                        ? `Viewing ${displayedRegistrations.length} registered candidates.`
                                        : 'Overview of all event sign-ups.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {!selectedEvent ? (
                            // Aggregated View (Events List)
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                        <th className="p-6 font-bold border-b border-gray-100">Event Name</th>
                                        <th className="p-6 font-bold border-b border-gray-100 text-center">Candidates</th>
                                        <th className="p-6 font-bold border-b border-gray-100 text-center">Total Tickets Left</th>
                                        <th className="p-6 font-bold border-b border-gray-100 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {events.map((event, index) => {
                                        const ticketsLeft = event.total_tickets - event.registered_count;
                                        return (
                                            <tr key={event.id || index} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedEvent(event)}>
                                                <td className="p-6 font-bold text-gray-900">{event.title}</td>
                                                <td className="p-6 text-center">
                                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                                                        <Users size={14} /> {event.registered_count}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${ticketsLeft > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                        <Ticket size={14} /> {ticketsLeft} / {event.total_tickets}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <button className="text-emerald-600 font-bold text-sm hover:underline flex items-center justify-end gap-1">
                                                        View Details <ChevronRight size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {events.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-12 text-center text-gray-400">
                                                No events found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            // Detailed View (Registrations for selected event)
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                        <th className="p-6 font-bold border-b border-gray-100">Participant</th>
                                        <th className="p-6 font-bold border-b border-gray-100">Contact Details</th>
                                        <th className="p-6 font-bold border-b border-gray-100 text-center">Tickets</th>
                                        <th className="p-6 font-bold border-b border-gray-100">Registered At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {displayedRegistrations.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-gray-50 transition">
                                            <td className="p-6">
                                                <div className="font-bold text-gray-800">{reg.name}</div>
                                            </td>
                                            <td className="p-6 text-sm text-gray-600">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Mail size={14} className="text-emerald-600" /> {reg.email}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-emerald-600" /> {reg.phone}
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                                                    <Ticket size={14} /> {reg.ticket_count}
                                                </span>
                                            </td>
                                            <td className="p-6 text-sm text-gray-500">
                                                {new Date(reg.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {displayedRegistrations.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-12 text-center text-gray-400">
                                                No candidates registered yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventRegistrations;
