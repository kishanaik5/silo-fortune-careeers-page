import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, User, ArrowRight, Clock, Tag, X, Search } from 'lucide-react';
import AgriSummit from '../assets/agri-summit.png';
import HackathonImage from '../assets/hackathon.jpg';
import RuralWomenImage from '../assets/rural-women.png';


const Events = () => {
    const navigate = useNavigate();

    // Event Modal State
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        ticket_count: 1
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Story Modal State
    const [selectedStory, setSelectedStory] = useState(null);

    // Merging Events and Blogs into a unified "Insights & Events" view or keeping separate but visually consistent
    // The user referred to them as "5 different blogs", so I will ensure distinct images for all.

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

    const blogs = [
        {
            id: 1,
            title: "The Future of Smart Farming",
            date: "October 10, 2025",
            readTime: "5 min read",
            category: "Technology",
            excerpt: "How IoT and AI are revolutionizing the way we grow food and manage livestock effectively.",
            content: "Smart farming represents the application of modern information and communication technologies (ICT) into agriculture. In the scenario of the Third Green Revolution, IoT and AI are revolutionizing the way we grow food and manage livestock effectively. Precision agriculture allows farmers to maximize yields using minimal resources such as water, fertilizer, and seeds. By using various sensors, farmers can monitor crop moisture, soil quality, and livestock health in real-time, leading to data-driven decisions that improve efficiency and sustainability.",
            // Smart Farming: Drone in field
            image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=2070&auto=format&fit=crop",
            author: "Dr. Ramesh Gupta",
            authorRole: "Chief Agronomist"
        },
        {
            id: 2,
            title: "Sustainable Dairy Practices",
            date: "September 28, 2025",
            readTime: "4 min read",
            category: "Sustainability",
            excerpt: "Implementing eco-friendly practices in dairy farming to ensure long-term productivity and animal health.",
            content: "Sustainable dairy farming helps preserve the environment, improve animal welfare, and ensure the economic viability of farms. Key practices include efficient manure management to reduce methane emissions, using renewable energy sources like biogas, and implementing rotational grazing to maintain soil health. By focusing on cow comfort and health, farmers can also increase milk production naturally while reducing the need for antibiotics and other chemical interventions.",
            // Dairy: Cows in green field
            image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=2070&auto=format&fit=crop",
            author: "Sarah Jenkins",
            authorRole: "Sustainability Lead"
        },
        {
            id: 3,
            title: "Empowering Rural Women",
            date: "August 15, 2025",
            readTime: "6 min read",
            category: "Community",
            excerpt: "Stories of change and empowerment from the heart of rural India.",
            content: "Women play a crucial role in agriculture, yet they often face significant barriers in accessing resources and markets. By empowering rural women with training, financial literacy, and access to modern farming tools, we can unlock their potential as key drivers of rural development. Success stories from across India show how women-led cooperatives are transforming local economies, improving food security, and driving social change in their communities.",
            // Rural Women: Authentic representation
            image: RuralWomenImage,
            author: "Anjali Singh",
            authorRole: "Community Manager"
        }
    ];

    // Event Registration Handlers
    const handleRegister = (event) => {
        setSelectedEvent(event);
        setShowEventModal(true);
        setSuccess(false);
        setFormData({ name: '', email: '', phone: '', ticket_count: 1 });
    };

    const handleCloseEventModal = () => {
        setShowEventModal(false);
        setSelectedEvent(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email.endsWith('@gmail.com')) {
            alert('Only @gmail.com addresses are allowed.');
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
                    handleCloseEventModal();
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
            {/* Header with Background Pattern */}
            <div className="relative bg-emerald-900 text-white py-20 px-6 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/ag-square.png')]"></div>
                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-emerald-800 text-emerald-200 text-sm font-semibold mb-4 tracking-wide uppercase">Community & Knowledge</span>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 track-tight">Events & Insights</h1>
                    <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                        Stay connected with our community through events and explore the latest innovations in sustainable agriculture.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16 max-w-7xl">

                {/* Events Section */}
                <div className="mb-24">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-silo-gold pl-4">Upcoming Events</h2>
                        <button onClick={() => navigate('/events/all')} className="text-emerald-700 font-semibold hover:text-emerald-800 transition hidden md:block">View All Events &rarr;</button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        {events.map(event => (
                            <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group border border-gray-100 flex flex-col h-full">
                                <div className="h-64 overflow-hidden relative">
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 z-10 uppercase tracking-wider shadow-sm">
                                        {event.category}
                                    </div>
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-in-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="p-8 flex-grow flex flex-col">
                                    <div className="flex items-center gap-6 text-emerald-600 text-sm font-semibold mb-4">
                                        <span className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full"><Calendar size={16} /> {event.date}</span>
                                        <span className="flex items-center gap-2 text-gray-500"><MapPin size={16} /> {event.location}</span>
                                        <span className="flex items-center gap-2 text-emerald-700 font-bold">₹{event.price > 0 ? event.price : 'Free'}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{event.title}</h3>
                                        <div className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-600">
                                            {event.total_tickets - event.registered_count} / {event.total_tickets} Tickets Left
                                        </div>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed mb-8 flex-grow">
                                        {event.description}
                                    </p>
                                    <button
                                        onClick={() => handleRegister(event)}
                                        disabled={event.registered_count >= event.total_tickets}
                                        className={`w-full font-bold py-3 rounded-xl transition-colors shadow-sm ${event.registered_count >= event.total_tickets
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-50 text-gray-800 hover:bg-emerald-600 hover:text-white'
                                            }`}
                                    >
                                        {event.registered_count >= event.total_tickets ? 'Sold Out' : 'Register Now'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Blogs Section */}
                <div>
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-silo-green pl-4">Latest Stories & Insights</h2>
                        <button onClick={() => navigate('/stories/all')} className="text-emerald-700 font-semibold hover:text-emerald-800 transition hidden md:block">Read More Stories &rarr;</button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {blogs.map(blog => (
                            <div key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col h-full">
                                <div className="h-56 overflow-hidden relative">
                                    <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold z-10 shadow-md">
                                        {blog.category}
                                    </div>
                                    <img
                                        src={blog.image}
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out"
                                    />
                                </div>
                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="flex items-center gap-3 text-gray-400 text-xs font-medium mb-4">
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {blog.date}</span>
                                        <span className="mx-1">•</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {blog.readTime}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition leading-tight">{blog.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                                        {blog.excerpt}
                                    </p>

                                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                                                {blog.author.charAt(0)}
                                            </div>
                                            <div className="text-xs">
                                                <p className="font-bold text-gray-900">{blog.author}</p>
                                                <p className="text-gray-500">{blog.authorRole}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedStory(blog)}
                                            className="text-emerald-600 hover:text-emerald-800 transition p-2 rounded-full hover:bg-emerald-50"
                                        >
                                            <ArrowRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Event Registration Modal */}
            {showEventModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                        <button onClick={handleCloseEventModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
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
                                <form onSubmit={handleEventSubmit} className="space-y-4">
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
                                        <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="+91 98765 43210" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Number of Tickets</label>
                                        <input required name="ticket_count" value={formData.ticket_count} onChange={handleChange} type="number" min="1" max="10" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                                        {selectedEvent?.price > 0 && (
                                            <p className="text-right text-sm font-bold text-gray-800 mt-2">
                                                Total: ₹{formData.ticket_count * selectedEvent.price}
                                            </p>
                                        )}
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

            {/* Story Modal */}
            {selectedStory && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative max-h-[90vh] flex flex-col">
                        <button
                            onClick={() => setSelectedStory(null)}
                            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all z-20"
                        >
                            <X size={24} />
                        </button>

                        <div className="h-64 md:h-80 overflow-hidden relative flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-20 text-white">
                                <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold inline-block mb-3 shadow-lg">
                                    {selectedStory.category}
                                </div>
                                <h2 className="text-3xl md:text-4xl font-extrabold leading-tight shadow-black drop-shadow-lg">{selectedStory.title}</h2>
                                <div className="flex items-center gap-4 text-emerald-100 text-sm font-medium mt-3">
                                    <span className="flex items-center gap-1"><Calendar size={16} /> {selectedStory.date}</span>
                                    <span className="flex items-center gap-1"><Clock size={16} /> {selectedStory.readTime}</span>
                                </div>
                            </div>
                            <img
                                src={selectedStory.image}
                                alt={selectedStory.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                                    {selectedStory.author.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">{selectedStory.author}</p>
                                    <p className="text-emerald-600 font-medium">{selectedStory.authorRole}</p>
                                </div>
                            </div>

                            <div className="prose prose-lg text-gray-700 max-w-none leading-relaxed">
                                <p className="text-xl font-medium text-gray-500 mb-6 italic border-l-4 border-emerald-500 pl-4">{selectedStory.excerpt}</p>
                                <p>{selectedStory.content}</p>
                                <p className="mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                                <p className="mt-4">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setSelectedStory(null)}
                                className="px-6 py-2 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 transition shadow-lg"
                            >
                                Close Article
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;
