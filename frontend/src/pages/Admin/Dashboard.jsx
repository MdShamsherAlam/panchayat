import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:3000/api/v1';

function NavBar() {
    const navigate = useNavigate();
    const logout = () => { localStorage.removeItem('token'); navigate('/login'); };
    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-amber-100 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🏛️</span>
                    <div>
                        <div className="font-bold text-green-800 text-sm">Gram Panchayat</div>
                        <div className="text-xs text-amber-600">Admin Control Panel</div>
                    </div>
                </div>
                <button onClick={logout} className="text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">Logout</button>
            </div>
        </nav>
    );
}

function StatCard({ emoji, label, value, bg, textColor, subtitle }) {
    return (
        <div className={`${bg} rounded-2xl p-5 border border-white shadow-sm`}>
            <div className="text-3xl mb-2">{emoji}</div>
            <div className={`text-3xl font-bold ${textColor}`}>{value ?? '—'}</div>
            <div className="text-sm text-gray-600 font-semibold mt-1">{label}</div>
            {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
        </div>
    );
}

function ProgressBar({ label, value, total, color }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold text-gray-700">{label}</span>
                <span className="text-gray-500">{value} ({pct}%)</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    useEffect(() => {
        axios.get(`${API}/complaint/analytics`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setAnalytics(res.data.data))
            .catch(() => toast.error('Analytics load nahi hua'))
            .finally(() => setLoading(false));
    }, []);

    const total = analytics?.stats?.reduce((a, c) => a + c.total, 0) || 0;
    const resolved = analytics?.stats?.find(s => s.status === 'Resolved')?.total || 0;
    const pending = analytics?.stats?.filter(s => !['Resolved', 'Closed'].includes(s.status)).reduce((a, c) => a + c.total, 0) || 0;
    const closed = analytics?.stats?.find(s => s.status === 'Closed')?.total || 0;
    const escalated = analytics?.escalatedCount || 0;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const STATUS_BAR_COLORS = {
        'Open': 'bg-yellow-400',
        'In Progress': 'bg-blue-500',
        'Resolved': 'bg-green-500',
        'Closed': 'bg-gray-400',
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f9f3e8] font-mukta flex flex-col">
            <NavBar />
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center"><div className="text-5xl animate-pulse mb-3">📊</div><p className="text-green-800 font-semibold">Analytics load ho raha hai...</p></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f9f3e8] font-mukta">
            <NavBar />
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-green-900">System Analytics</h1>
                        <p className="text-sm text-gray-500">Poore system ka overview — real-time data</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-sm font-bold ${resolutionRate >= 70 ? 'bg-green-100 text-green-700' : resolutionRate >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {resolutionRate}% Resolution Rate
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard emoji="📋" label="Total Shikayatein" value={total} bg="bg-white" textColor="text-green-900" subtitle="Sab status mila ke" />
                    <StatCard emoji="⏳" label="Pending" value={pending} bg="bg-yellow-50" textColor="text-yellow-700" subtitle="Open + In Progress" />
                    <StatCard emoji="✅" label="Resolved" value={resolved} bg="bg-green-50" textColor="text-green-700" subtitle="Khatam hui shikayatein" />
                    <StatCard emoji="⚠️" label="Escalated" value={escalated} bg="bg-red-50" textColor="text-red-700" subtitle="SLA breach hua" />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Status Breakdown */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-amber-100 shadow-sm">
                        <h2 className="font-bold text-green-900 text-lg mb-5">Status Breakdown</h2>
                        <div className="space-y-4">
                            {analytics?.stats?.map(s => (
                                <ProgressBar key={s.status} label={s.status} value={s.total} total={total} color={STATUS_BAR_COLORS[s.status] || 'bg-gray-400'} />
                            ))}
                        </div>
                        {total === 0 && <p className="text-gray-400 text-center py-8">Koi data nahi mila</p>}
                    </div>

                    {/* System Health */}
                    <div className="bg-green-800 rounded-2xl p-6 text-white shadow-sm">
                        <h2 className="font-bold text-lg mb-5">🖥️ System Health</h2>
                        <div className="space-y-3">
                            {[
                                { label: 'Auto-Escalation Engine', status: 'Active' },
                                { label: 'SLA Breach Detection', status: 'Active' },
                                { label: 'Database Sync', status: 'Healthy' },
                                { label: 'Photo Upload Service', status: 'Active' },
                                { label: 'Socket.IO Real-time', status: 'Active' },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between items-center py-2 border-b border-green-700/50">
                                    <span className="text-green-200 text-sm">{item.label}</span>
                                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">{item.status}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-green-300 text-xs mt-5 text-center italic">
                            SLA timers har 24 ghante mein check hote hain
                        </p>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm text-center">
                        <div className="text-4xl mb-2">🏆</div>
                        <div className="text-2xl font-bold text-green-800">{resolved}</div>
                        <div className="text-sm text-gray-500">Resolved Complaints</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm text-center">
                        <div className="text-4xl mb-2">🔒</div>
                        <div className="text-2xl font-bold text-gray-600">{closed}</div>
                        <div className="text-sm text-gray-500">Closed Complaints</div>
                    </div>
                    <div className={`rounded-2xl p-5 border shadow-sm text-center ${escalated > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                        <div className="text-4xl mb-2">{escalated > 0 ? '🚨' : '🟢'}</div>
                        <div className={`text-2xl font-bold ${escalated > 0 ? 'text-red-700' : 'text-green-700'}`}>{escalated}</div>
                        <div className="text-sm text-gray-500">SLA Escalations</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
