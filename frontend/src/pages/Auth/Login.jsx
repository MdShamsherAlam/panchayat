import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login = () => {
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
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-800 to-green-900 text-white flex-col justify-between p-12">
                <div>
                    <Link to="/" className="flex items-center gap-2 mb-12">
                        <span className="text-3xl">🏘️</span>
                        <div>
                            <div className="font-bold text-xl">Gram Panchayat</div>
                            <div className="text-xs text-green-300">Digital Shikayat Pranali</div>
                        </div>
                    </Link>
                    <h2 className="text-4xl font-bold leading-tight mb-4">
                        Nagarikon ki<br />
                        <span className="text-amber-300">Awaaz Online</span>
                    </h2>
                    <p className="text-green-200 text-sm leading-relaxed">
                        Apni samasya ko record karein aur sarkar tak pahunchayein.
                        Transparent, fast aur reliable.
                    </p>
                </div>
                <div className="space-y-4">
                    {['📋 Shikayat darj karein aur track karein', '⏱️ SLA ke saath guaranteed response', '📊 Real-time status updates'].map(f => (
                        <div key={f} className="flex items-center gap-3 text-green-200 text-sm">
                            <span>{f}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center bg-[#f9f3e8] px-6 py-12">
                <div className="w-full max-w-md">
                    <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
                        <span className="text-2xl">🏘️</span>
                        <span className="font-bold text-green-800">Gram Panchayat</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-green-900 mb-1">Swagat Hai! 🙏</h1>
                    <p className="text-gray-500 text-sm mb-8">Apna account login karein</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                name="password" type="password" required
                                value={formData.password} onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                            />
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-60"
                        >
                            {loading ? '⏳ Login ho raha hai...' : '🔑 Login Karen'}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-xs text-amber-700 font-semibold mb-1">Default Admin Login:</p>
                        <p className="text-xs text-gray-600">admin@panchayat.gov.in / admin1010#</p>
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Account nahi hai?{' '}
                        <Link to="/register" className="text-green-700 font-bold hover:underline">
                            Register Karen →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
