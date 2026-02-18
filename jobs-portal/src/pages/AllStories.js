import React, { useState } from 'react';
import { Calendar, ArrowLeft, Search, Clock, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RuralWomenImage from '../assets/rural-women.png';

const AllStories = () => {
    const navigate = useNavigate();
    const [selectedStory, setSelectedStory] = useState(null);

    const blogs = [
        {
            id: 1,
            title: "The Future of Smart Farming",
            date: "October 10, 2025",
            readTime: "5 min read",
            category: "Technology",
            excerpt: "How IoT and AI are revolutionizing the way we grow food and manage livestock effectively.",
            content: "Smart farming represents the application of modern information and communication technologies (ICT) into agriculture. In the scenario of the Third Green Revolution, IoT and AI are revolutionizing the way we grow food and manage livestock effectively. Precision agriculture allows farmers to maximize yields using minimal resources such as water, fertilizer, and seeds. By using various sensors, farmers can monitor crop moisture, soil quality, and livestock health in real-time, leading to data-driven decisions that improve efficiency and sustainability.",
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
            image: RuralWomenImage,
            author: "Anjali Singh",
            authorRole: "Community Manager"
        },
        {
            id: 4,
            title: "Organic Farming: A Beginner's Guide",
            date: "July 22, 2025",
            readTime: "8 min read",
            category: "Farming",
            excerpt: "A comprehensive guide for farmers looking to transition from conventional to organic farming methods.",
            content: "Transitioning to organic farming is a journey that requires patience and dedication. It involves shifting from chemical inputs to natural alternatives for pest control and soil fertility. Key steps include soil testing, composting, crop rotation, and green manuring. While the initial years may see a dip in yield, the long-term benefits include healthier soil, premium market prices for produce, and lower input costs. This guide covers the essential first steps for any farmer looking to go organic.",
            image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=2071&auto=format&fit=crop",
            author: "Vikram Malhotra",
            authorRole: "Organic Specialist"
        },
        {
            id: 5,
            title: "Water Conservation Techniques",
            date: "June 10, 2025",
            readTime: "5 min read",
            category: "Resources",
            excerpt: "Innovative irrigation methods to save water and maximize crop yield in drought-prone areas.",
            content: "Water scarcity is a growing challenge for agriculture globally. Adopting water conservation techniques is no longer optional but essential. Drip irrigation, sprinkler systems, and rainwater harvesting are proven methods to optimize water use. mulching helps retain soil moisture, while selecting drought-resistant crop varieties ensures yields even in low-water conditions. These techniques not only save water but also reduce energy costs associated with pumping.",
            image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070&auto=format&fit=crop",
            author: "Priya Desai",
            authorRole: "Water Engineer"
        },
        {
            id: 6,
            title: "The Role of Drones in Agriculture",
            date: "May 05, 2025",
            readTime: "7 min read",
            category: "Technology",
            excerpt: "Exploring how drone technology is being used for crop monitoring, spraying, and field analysis.",
            content: "Agricultural drones are transforming farming by providing aerial insights that were previously impossible or too costly to obtain. Drones equipped with multispectral cameras can assess plant health, monitor crop growth, and detect pest infestations early. They are also used for precision spraying of fertilizers and pesticides, which reduces chemical usage and exposure for farmers. As regulations evolve and technology becomes cheaper, drones are set to become a standard tool in the modern farmer's arsenal.",
            image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=2070&auto=format&fit=crop",
            author: "Karthik Reddy",
            authorRole: "Tech Innovator"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-20 font-sans">
            <div className="bg-emerald-900 text-white py-12 px-6">
                <div className="container mx-auto max-w-7xl">
                    <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-emerald-200 hover:text-white mb-6 transition">
                        <ArrowLeft size={20} /> Back to Events
                    </button>
                    <h1 className="text-4xl font-extrabold mb-4">Latest Stories & Insights</h1>
                    <p className="text-emerald-100 text-lg">Explore articles, success stories, and expert insights on sustainable agriculture.</p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 max-w-7xl">
                {/* Search - Visual only for now */}
                <div className="flex flex-col md:flex-row gap-4 mb-10">
                    <div className="relative flex-grow max-w-md">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input type="text" placeholder="Search stories..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

export default AllStories;
