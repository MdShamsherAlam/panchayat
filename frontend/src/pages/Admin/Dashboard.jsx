import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:3000/api/v1';

function NavBar() {
    const navigate = useNavigate();
    const logout = () => { localStorage.removeItem('token'); navigate('/login'); };
    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/50 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="text-3xl bg-green-900 p-2 rounded-2xl">🏛️</span>
                    <div>
                        <div className="font-black text-green-900 text-base leading-tight">Gram Panchayat</div>
                        <div className="text-[10px] text-amber-600 font-black uppercase tracking-widest">Admin Control Panel • System Monitor</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-black text-gray-800">Administrator Access</span>
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">System Root</span>
                    </div>
                    <button onClick={logout} className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-600 hover:text-white transition-all shadow-sm">LOGOUT</button>
                </div>
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-green-900">System Performance Analytics</h1>
                        <p className="text-sm text-gray-500">Real-time monitoring across all wards</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="bg-white px-4 py-2 rounded-xl border border-amber-100 shadow-sm flex flex-col items-center">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Avg. Resolution</span>
                            <span className="text-lg font-bold text-blue-600">{analytics?.avgResolutionHours || 0}h</span>
                        </div>
                        <div className={`px-4 py-2 rounded-xl border shadow-sm flex flex-col items-center min-w-[120px] ${resolutionRate >= 70 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Success Rate</span>
                            <span className={`text-lg font-bold ${resolutionRate >= 70 ? 'text-green-700' : 'text-yellow-700'}`}>{resolutionRate}%</span>
                        </div>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard emoji="📋" label="KUL SHIKAYATEIN" value={analytics?.total} bg="bg-white" textColor="text-green-900" subtitle="Total Logged" />
                    <StatCard emoji="⏳" label="PENDING ACTION" value={(analytics?.total || 0) - (analytics?.resolved || 0)} bg="bg-white" textColor="text-amber-600" subtitle="Needs Attention" />
                    <StatCard emoji="✅" label="RESOLVED" value={analytics?.resolved} bg="bg-white" textColor="text-green-700" subtitle="Completed" />
                    <StatCard emoji="🚨" label="ESCALATED" value={analytics?.escalatedCount} bg="bg-red-50/50" textColor="text-red-700" subtitle="High Priority" />
                </div>

                {/* Ward-wise Density & Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Ward Breakdown */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-white shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b border-amber-50 pb-4">
                            <h2 className="font-black text-green-900 text-lg uppercase tracking-tight">Ward-wise Density</h2>
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-lg">Performance Map</span>
                        </div>
                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {analytics?.wardStats?.map(w => {
                                const rate = w.total > 0 ? (w.resolved / w.total) * 100 : 0;
                                return (
                                    <div key={w.wardNo} className="group">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <span className="font-black text-gray-800 text-sm">Ward No. {w.wardNo}</span>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase">{w.resolved} resolved of {w.total}</div>
                                            </div>
                                            <div className="text-right">
                                                {w.escalated > 0 && <span className="text-red-600 font-black text-xs mr-2 animate-pulse">🚨 {w.escalated} Escalated</span>}
                                                <span className={`text-xs font-black ${rate >= 70 ? 'text-green-600' : 'text-amber-600'}`}>{Math.round(rate)}%</span>
                                            </div>
                                        </div>
                                        <div className="h-3 bg-gray-50 rounded-full overflow-hidden flex border border-gray-100 shadow-inner">
                                            <div className={`h-full transition-all duration-1000 ${rate >= 70 ? 'bg-green-500' : rate >= 40 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${rate}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Officer Performance */}
                    <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm space-y-5">
                        <h2 className="font-bold text-green-900 text-lg">Officer Leaderboard</h2>
                        <div className="space-y-4">
                            {analytics?.officerPerformance?.map((op, i) => (
                                <div key={op.officialId} className="flex items-center gap-4 p-3 rounded-xl bg-amber-50/30 border border-amber-100/50">
                                    <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-green-900 text-sm truncate">{op.official?.name}</div>
                                        <div className="text-[10px] text-gray-400 uppercase">{op.official?.email}</div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-sm font-bold text-green-700">{op.resolved}</div>
                                        <div className="text-[10px] text-gray-400">SOLVED</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Status Breakdown Bar */}
                <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm text-center">
                    <h2 className="font-bold text-green-900 text-lg mb-6">Status Overview</h2>
                    <div className="flex h-12 rounded-2xl overflow-hidden shadow-inner bg-gray-50">
                        {analytics?.stats?.map(s => {
                            const pct = analytics.total > 0 ? (s.total / analytics.total) * 100 : 0;
                            return (
                                <div key={s.status}
                                    style={{ width: `${pct}%` }}
                                    className={`${STATUS_BAR_COLORS[s.status] || 'bg-gray-400'} flex items-center justify-center text-[10px] font-bold text-white transition-all hover:opacity-90 cursor-default`}
                                    title={`${s.status}: ${s.total}`}>
                                    {pct > 15 ? s.status : ''}
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                        {Object.entries(STATUS_BAR_COLORS).map(([label, color]) => (
                            <div key={label} className="flex items-center gap-1.5 grayscale-[0.5]">
                                <div className={`w-3 h-3 rounded-full ${color}`} />
                                <span className="text-xs text-gray-500 font-semibold uppercase">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

}
