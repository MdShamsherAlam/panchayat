import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login = () => {
    const [loginType, setLoginType] = useState('user'); // 'user' (Citizen/Official) or 'admin'
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:3000/api/v1/auth/login', formData);
            const { token } = res.data.data;
            localStorage.setItem('token', token);
            const payload = JSON.parse(atob(token.split('.')[1]));
            toast.success('Login successful! Swagat hai 🙏');
            if (payload.role === 'admin') navigate('/admin');
            else if (payload.role === 'official') navigate('/official');
            else navigate('/citizen');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Dobara try karein.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-mukta">
            {/* Left Panel */}
            <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-green-900 via-green-800 to-amber-900 text-white flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 mb-12 hover:opacity-80 transition">
                        <span className="text-3xl">🏘️</span>
                        <div>
                            <div className="font-bold text-xl leading-tight">Gram Panchayat</div>
                            <div className="text-xs text-green-300">Digital Shikayat Pranali</div>
                        </div>
                    </Link>
                    <h2 className="text-5xl font-bold leading-tight mb-6">
                        Desh ka Vikas,<br />
                        <span className="text-amber-400">Gaon se Shuru</span>
                    </h2>
                    <p className="text-green-100/80 text-base leading-relaxed max-w-sm">
                        Digital India ke sang, apni panchayat ko banayein adhunik aur paradarshi.
                        Nagarikon ki seva hamari prathmikta.
                    </p>
                </div>
                <div className="relative z-10 space-y-5">
                    {[
                        { e: '🛡️', t: 'Surakshit aur Bharosemand' },
                        { e: '⏱️', t: 'SLA ke saath samay par samadhan' },
                        { e: '📈', t: 'Real-time tracking aur transparency' }
                    ].map(f => (
                        <div key={f.t} className="flex items-center gap-3 text-green-200">
                            <span className="text-xl bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center border border-white/10">{f.e}</span>
                            <span className="text-sm font-medium">{f.t}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex flex-col bg-[#fcf9f2] relative">
                {/* Back to Home Link */}
                <div className="p-6">
                    <Link to="/" className="inline-flex items-center gap-2 text-green-700 font-bold hover:text-green-900 transition-all group">
                        <span className="bg-white border border-green-100 p-2 rounded-lg shadow-sm group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="text-sm">Home par jayein</span>
                    </Link>
                </div>

                <div className="flex-1 flex items-center justify-center px-6 pb-12">
                    <div className="w-full max-w-sm">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-black text-green-900 mb-2">Swagat Hai! 🙏</h1>
                            <p className="text-gray-500 text-sm">Apna account login karke aage badhein</p>
                        </div>

                        {/* Professional Tabs */}
                        <div className="flex bg-white/50 backdrop-blur-sm p-1 rounded-2xl border border-amber-100 mb-8 shadow-inner">
                            <button onClick={() => setLoginType('user')}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${loginType === 'user' ? 'bg-green-700 text-white shadow-xl' : 'text-gray-500 hover:text-green-700'}`}>
                                👨‍🌾 Nagarik / Adhikari
                            </button>
                            <button onClick={() => setLoginType('admin')}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${loginType === 'admin' ? 'bg-orange-600 text-white shadow-xl' : 'text-gray-500 hover:text-orange-600'}`}>
                                🏛️ Prashasan (Admin)
                            </button>
                        </div>

                        {/* Glass Container */}
                        <div className="bg-white rounded-[2rem] p-8 border border-white shadow-2xl relative">
                            {loginType === 'admin' && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-200">Admin Section</div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-black text-green-800 uppercase tracking-wider mb-2 ml-1">
                                        <span>📧</span> Email Address
                                    </label>
                                    <input
                                        name="email" type="email" required
                                        value={formData.email} onChange={handleChange}
                                        placeholder="aapka@email.com"
                                        className="w-full px-5 py-3.5 rounded-2xl border border-amber-100 bg-amber-50/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white text-gray-800 transition-all placeholder:text-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-black text-green-800 uppercase tracking-wider mb-2 ml-1">
                                        <span>🔑</span> Password
                                    </label>
                                    <input
                                        name="password" type="password" required
                                        value={formData.password} onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3.5 rounded-2xl border border-amber-100 bg-amber-50/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white text-gray-800 transition-all placeholder:text-gray-300"
                                    />
                                </div>
                                <button
                                    type="submit" disabled={loading}
                                    className={`w-full font-black py-4 rounded-2xl transition-all shadow-xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-60 flex items-center justify-center gap-2 ${loginType === 'admin' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-700 hover:bg-green-800'} text-white`}>
                                    {loading ? (
                                        <>⏳ Login ho raha...</>
                                    ) : (
                                        <>{loginType === 'admin' ? '🏛️ Admin Access' : '🔑 Account Login'}</>
                                    )}
                                </button>
                            </form>
                        </div>

                        {loginType === 'user' && (
                            <p className="text-center text-sm text-gray-500 mt-8">
                                Account nahi hai?{' '}
                                <Link to="/register" className="text-green-700 font-black hover:underline">
                                    Naya Register Karen →
                                </Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
