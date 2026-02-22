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
            <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 mb-12 hover:opacity-80 transition">
                        <span className="text-3xl">🏘️</span>
                        <div>
                            <div className="font-bold text-xl leading-tight">Gram Panchayat</div>
                            <div className="text-xs text-amber-200">Digital Shikayat Pranali</div>
                        </div>
                    </Link>
                    <h2 className="text-5xl font-bold leading-tight mb-6">
                        Panchayat se<br />
                        <span className="text-white">Sidha Samvad 🌿</span>
                    </h2>
                    <p className="text-amber-50 text-base leading-relaxed max-w-sm">
                        Apni samasya ko record karein aur vikas ka hissa banein.
                        Aapki awaaz hi hamari shakti hai.
                    </p>
                </div>
                <div className="relative z-10 bg-white/10 rounded-3xl p-6 border border-white/20 backdrop-blur-sm">
                    <p className="text-sm font-bold mb-3 flex items-center gap-2">
                        <span className="bg-amber-500 w-2 h-2 rounded-full animate-pulse" />
                        Registration Free & Easy
                    </p>
                    <p className="text-amber-50/80 text-xs leading-relaxed">
                        Bas 2 minute mein apna account banayein. Koi lambi process nahi, koi fees nahi.
                        Digital India, Sashakt Panchayat.
                    </p>
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex flex-col bg-[#fcf9f2] relative overflow-y-auto">
                {/* Back to Home Link */}
                <div className="p-6">
                    <Link to="/" className="inline-flex items-center gap-2 text-amber-700 font-bold hover:text-amber-800 transition-all group">
                        <span className="bg-white border border-amber-100 p-2 rounded-lg shadow-sm group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="text-sm">Home par jayein</span>
                    </Link>
                </div>

                <div className="flex items-center justify-center px-6 pb-12">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-black text-green-900 mb-2">Naya Account ✨</h1>
                            <p className="text-gray-500 text-sm">Apni pehchaan darj karein</p>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-white shadow-2xl">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-amber-800 uppercase tracking-wider mb-2 block ml-1">Poora Naam</label>
                                        <input
                                            name="name" type="text" required
                                            value={formData.name} onChange={handleChange}
                                            placeholder="Rameshwar Prasad"
                                            className="w-full px-5 py-3.5 rounded-2xl border border-amber-100 bg-amber-50/20 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800 transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-amber-800 uppercase tracking-wider mb-2 block ml-1">Ward Number</label>
                                        <input
                                            name="wardNo" type="text" required
                                            value={formData.wardNo} onChange={handleChange}
                                            placeholder="Jaise: 5"
                                            className="w-full px-5 py-3.5 rounded-2xl border border-amber-100 bg-amber-50/20 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800 transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black text-amber-800 uppercase tracking-wider mb-2 block ml-1">Email Address</label>
                                    <input
                                        name="email" type="email" required
                                        value={formData.email} onChange={handleChange}
                                        placeholder="aapka@email.com"
                                        className="w-full px-5 py-3.5 rounded-2xl border border-amber-100 bg-amber-50/20 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800 transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-amber-800 uppercase tracking-wider mb-2 block ml-1">Aapka Password</label>
                                    <input
                                        name="password" type="password" required minLength={6}
                                        value={formData.password} onChange={handleChange}
                                        placeholder="Kam se kam 6 characters"
                                        className="w-full px-5 py-3.5 rounded-2xl border border-amber-100 bg-amber-50/20 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800 transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-amber-800 uppercase tracking-wider mb-3 block ml-1 text-center">Aapka Role Chunen</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {roleOptions.map(role => (
                                            <label key={role.value} className={`relative p-3 rounded-2xl border-2 cursor-pointer transition-all ${formData.roleSlug === role.value ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-100' : 'border-amber-100 bg-white hover:border-amber-300'}`}>
                                                <input type="radio" name="roleSlug" value={role.value} checked={formData.roleSlug === role.value} onChange={handleChange} className="hidden" />
                                                <div className="text-center">
                                                    <div className="text-xl mb-1">{role.value === 'citizen' ? '👨‍🌾' : '👨‍💼'}</div>
                                                    <div className={`font-black text-[10px] uppercase tracking-tighter ${formData.roleSlug === role.value ? 'text-amber-800' : 'text-gray-400'}`}>
                                                        {role.value === 'citizen' ? 'Nagarik' : 'Adhikari'}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit" disabled={loading}
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-60 flex items-center justify-center gap-2 mt-4">
                                    {loading ? '⏳ Register ho raha...' : '✨ Register Karen'}
                                </button>
                            </form>
                        </div>

                        <p className="text-center text-sm text-gray-500 mt-8 font-medium">
                            Pehle se account hai?{' '}
                            <Link to="/login" className="text-amber-700 font-black hover:underline">
                                Login Karen →
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
