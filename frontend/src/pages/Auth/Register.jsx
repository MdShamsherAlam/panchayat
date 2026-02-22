import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', roleSlug: 'citizen', wardNo: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:3000/api/v1/auth/register', formData);
            toast.success('Registration successful! Ab login karein 🎉');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const roleOptions = [
        { value: 'citizen', label: '👨‍🌾 Nagarik (Citizen)', desc: 'Shikayat darj karein aur track karein' },
        { value: 'official', label: '👨‍💼 Panchayat Adhikari', desc: 'Ward ki shikayatein manage karein' },
    ];

    return (
        <div className="min-h-screen flex font-mukta">
            {/* Left Panel */}
            <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-amber-600 to-amber-700 text-white flex-col justify-between p-12">
                <div>
                    <Link to="/" className="flex items-center gap-2 mb-12">
                        <span className="text-3xl">🏘️</span>
                        <div>
                            <div className="font-bold text-xl">Gram Panchayat</div>
                            <div className="text-xs text-amber-200">Digital Shikayat Pranali</div>
                        </div>
                    </Link>
                    <h2 className="text-4xl font-bold leading-tight mb-4">
                        Hamare Saath<br />
                        <span className="text-white">Juden! 🌿</span>
                    </h2>
                    <p className="text-amber-100 text-sm leading-relaxed">
                        Register karke apne ward ki samasyon ko digital tarike se uthayein.
                        Panchayat sunegi.
                    </p>
                </div>
                <div className="bg-white/20 rounded-2xl p-5 border border-white/20">
                    <p className="text-sm font-bold mb-2">✨ Registration free hai</p>
                    <p className="text-amber-100 text-xs">Koi technical knowledge nahin chahiye. Bas naam, email aur ward number chahiye.</p>
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center bg-[#f9f3e8] px-6 py-12 overflow-y-auto">
                <div className="w-full max-w-md">
                    <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
                        <span className="text-2xl">🏘️</span>
                        <span className="font-bold text-green-800">Gram Panchayat</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-green-900 mb-1">Naya Account Banayein</h1>
                    <p className="text-gray-500 text-sm mb-8">Apni pehchaan darj karein</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-green-800 mb-1">Poora Naam</label>
                            <input
                                name="name" type="text" required
                                value={formData.name} onChange={handleChange}
                                placeholder="Jaise: Rameshwar Prasad"
                                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-green-800 mb-1">Email Address</label>
                            <input
                                name="email" type="email" required
                                value={formData.email} onChange={handleChange}
                                placeholder="aapka@email.com"
                                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-green-800 mb-1">Password</label>
                            <input
                                name="password" type="password" required minLength={6}
                                value={formData.password} onChange={handleChange}
                                placeholder="Kam se kam 6 characters"
                                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-green-800 mb-2">Aap kaun hain?</label>
                            <div className="space-y-2">
                                {roleOptions.map(role => (
                                    <label key={role.value} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.roleSlug === role.value ? 'border-green-500 bg-green-50' : 'border-amber-100 bg-white hover:border-amber-300'}`}>
                                        <input type="radio" name="roleSlug" value={role.value} checked={formData.roleSlug === role.value} onChange={handleChange} className="mt-1 accent-green-600" />
                                        <div>
                                            <div className="font-semibold text-green-800 text-sm">{role.label}</div>
                                            <div className="text-xs text-gray-500">{role.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {(formData.roleSlug === 'citizen' || formData.roleSlug === 'official') && (
                            <div>
                                <label className="block text-sm font-semibold text-green-800 mb-1">Ward Number</label>
                                <input
                                    name="wardNo" type="text" required
                                    value={formData.wardNo} onChange={handleChange}
                                    placeholder="Jaise: 5, 12, 23"
                                    className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                                />
                            </div>
                        )}

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-60 mt-2"
                        >
                            {loading ? '⏳ Register ho raha hai...' : '✅ Register Karen'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Pehle se account hai?{' '}
                        <Link to="/login" className="text-green-700 font-bold hover:underline">Login Karen →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
