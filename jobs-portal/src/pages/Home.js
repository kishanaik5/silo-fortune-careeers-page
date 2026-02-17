import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen font-sans">
            {/* Hero Section */}
            <div
                className="relative h-screen flex items-center justify-center text-white text-center bg-emerald-900"
            >
                <div className="relative z-10 px-6 max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
                        Join Our Mission
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 font-light text-emerald-100">
                        We are building the future of sustainable agriculture. Find your next role at Silo Fortune and make a real impact.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/jobs')}
                            className="bg-silo-gold text-silo-green px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-400 transition transform hover:scale-105"
                        >
                            View Open Positions
                        </button>
                        <button
                            onClick={() => navigate('/events')}
                            className="border-2 border-white text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-white hover:text-silo-green transition"
                        >
                            Explore Events
                        </button>
                    </div>
                </div>
            </div>

            {/* About Workspace */}
            <div className="py-20 bg-white">
                <div className="container mx-auto px-6 max-w-5xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-silo-green mb-6">About Our Workspace</h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-3xl mx-auto">
                        At Silo Fortune, we operate with soldier-like discipline and farmer-like patience.
                        We are a team of innovators dedicated to solving the toughest challenges in agriculture
                        through technology and sustainable practices.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 text-left mt-12">
                        <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                            <CheckCircle className="text-silo-green mb-4" size={32} />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation First</h3>
                            <p className="text-gray-600">We leverage cutting-edge AI and IoT to transform traditional farming methods.</p>
                        </div>
                        <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-100">
                            <CheckCircle className="text-silo-gold mb-4" size={32} />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Farmer Centric</h3>
                            <p className="text-gray-600">Every solution we build starts with the farmer's needs at the core.</p>
                        </div>
                        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                            <CheckCircle className="text-blue-600 mb-4" size={32} />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Global Impact</h3>
                            <p className="text-gray-600">Our work contributes to food security and sustainable resource management worldwide.</p>
                        </div>
                    </div>
                </div>
            </div>



            {/* Footer Call to Action */}
            <div className="py-20 bg-silo-green text-white text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-6">Ready to make a difference?</h2>
                    <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
                        Explore our open positions and find where you belong in our mission to feed the world sustainably.
                    </p>
                    <button
                        onClick={() => navigate('/jobs')}
                        className="bg-white text-silo-green px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg"
                    >
                        See Open Roles
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
