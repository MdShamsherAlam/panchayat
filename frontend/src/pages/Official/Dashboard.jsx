import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:3000/api/v1';

const STATUS_COLORS = {
    'Open': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
    'Resolved': 'bg-green-100 text-green-800 border-green-200',
    'Closed': 'bg-gray-100 text-gray-600 border-gray-200',
};
const STATUS_ICONS = { 'Open': '📋', 'In Progress': '🔄', 'Resolved': '✅', 'Closed': '🔒' };
const NEXT_STATUSES = { 'Open': ['In Progress'], 'In Progress': ['Resolved', 'Closed'], 'Resolved': ['Closed'] };

function NavBar() {
    const navigate = useNavigate();
    const name = (() => { try { return JSON.parse(atob(localStorage.getItem('token').split('.')[1])).name; } catch { return 'Adhikari'; } })();
    const logout = () => { localStorage.removeItem('token'); navigate('/login'); };
    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-amber-100 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🏛️</span>
                    <div>
                        <div className="font-bold text-green-800 text-sm">Gram Panchayat</div>
                        <div className="text-xs text-amber-600">Adhikari Dashboard</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">👨‍💼 {name}</span>
                    <button onClick={logout} className="text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">Logout</button>
                </div>
            </div>
        </nav>
    );
}

export default function OfficialDashboard() {
    const [complaints, setComplaints] = useState([]);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('All');
    const [statusUpdate, setStatusUpdate] = useState({ status: '', comment: '' });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const token = localStorage.getItem('token');
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => { fetchComplaints(); }, []);

    const fetchComplaints = async () => {
        try {
            const res = await axios.get(`${API}/complaint/ward`, authHeader);
            setComplaints(res.data.data || []);
        } catch { toast.error('Shikayatein load nahi huin'); }
        finally { setLoading(false); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!statusUpdate.status) return toast.error('Status chunein');
        setUpdating(true);
        try {
            await axios.patch(`${API}/complaint/${selected.id}/status`, statusUpdate, authHeader);
            toast.success('Status update ho gaya! ✅');
            setSelected(null);
            setStatusUpdate({ status: '', comment: '' });
            fetchComplaints();
        } catch { toast.error('Update fail hua'); }
        finally { setUpdating(false); }
    };

    const counts = complaints.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {});
    const filtered = filter === 'All' ? complaints : complaints.filter(c => c.status === filter);

    if (loading) return (
        <div className="min-h-screen bg-[#f9f3e8] font-mukta flex flex-col">
            <NavBar />
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center"><div className="text-4xl animate-bounce mb-3">🔄</div><p className="text-green-800 font-semibold">Loading complaints...</p></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f9f3e8] font-mukta">
            <NavBar />
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total', count: complaints.length, bg: 'bg-white', tc: 'text-green-900', e: '📋' },
                        { label: 'Open', count: counts['Open'] || 0, bg: 'bg-yellow-50', tc: 'text-yellow-700', e: '📋' },
                        { label: 'In Progress', count: counts['In Progress'] || 0, bg: 'bg-blue-50', tc: 'text-blue-700', e: '🔄' },
                        { label: 'Resolved', count: counts['Resolved'] || 0, bg: 'bg-green-50', tc: 'text-green-700', e: '✅' },
                    ].map(s => (
                        <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-amber-100 shadow-sm`}>
                            <div className="text-2xl mb-1">{s.e}</div>
                            <div className={`text-2xl font-bold ${s.tc}`}>{s.count}</div>
                            <div className="text-xs text-gray-500">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                    {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${filter === f ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-600 border-amber-200 hover:border-green-400'}`}>
                            {f} {f !== 'All' && counts[f] ? `(${counts[f]})` : ''}
                        </button>
                    ))}
                </div>

                {/* Complaint Cards */}
                {filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <div className="text-5xl mb-3">📭</div>
                        <p className="font-semibold">Koi shikayat nahi mili</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(comp => {
                            const isOverdue = new Date(comp.slaDeadline) < new Date() && comp.status !== 'Resolved' && comp.status !== 'Closed';
                            return (
                                <div key={comp.id} onClick={() => { setSelected(comp); setStatusUpdate({ status: '', comment: '' }); }}
                                    className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[comp.status]}`}>
                                            {STATUS_ICONS[comp.status]} {comp.status}
                                        </span>
                                        {isOverdue && <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full border border-red-100 font-bold">⚠️ Overdue</span>}
                                    </div>
                                    <h3 className="font-bold text-green-900 text-base mt-2 mb-1 line-clamp-1">{comp.title}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{comp.description}</p>
                                    <div className="flex justify-between text-xs text-gray-400 border-t border-amber-50 pt-2">
                                        <span>Ward {comp.wardNo}</span>
                                        <span className={isOverdue ? 'text-red-500 font-bold' : ''}>{new Date(comp.slaDeadline).toLocaleDateString('hi-IN')}</span>
                                    </div>
                                    <p className="text-xs text-gray-300 font-mono mt-1 truncate">{comp.trackingId}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-amber-100 px-5 py-4 flex justify-between items-center rounded-t-2xl">
                            <div>
                                <h2 className="font-bold text-green-900 text-lg line-clamp-1">{selected.title}</h2>
                                <p className="text-xs text-gray-400 font-mono">{selected.trackingId}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-800 text-2xl leading-none ml-2">×</button>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="bg-amber-50 p-3 rounded-xl text-gray-700 text-sm border border-amber-100 italic">"{selected.description}"</p>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-blue-50 p-3 rounded-xl"><span className="text-gray-400 block mb-0.5">Ward</span><span className="font-bold text-blue-800">No. {selected.wardNo}</span></div>
                                <div className="bg-orange-50 p-3 rounded-xl"><span className="text-gray-400 block mb-0.5">SLA</span><span className="font-bold text-orange-700">{new Date(selected.slaDeadline).toLocaleDateString('hi-IN')}</span></div>
                                {selected.geoTag && <div className="bg-green-50 p-3 rounded-xl col-span-2"><span className="text-gray-400 block mb-0.5">Location</span><span className="font-mono text-green-700 text-xs">{selected.geoTag.lat?.toFixed(5)}, {selected.geoTag.lng?.toFixed(5)}</span></div>}
                            </div>

                            {NEXT_STATUSES[selected.status] && (
                                <form onSubmit={handleUpdate} className="border-t border-amber-100 pt-4 space-y-3">
                                    <h3 className="font-bold text-green-800">Status Update Karen</h3>
                                    <select required value={statusUpdate.status} onChange={e => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-amber-200 rounded-xl bg-amber-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                                        <option value="">-- Status chunen --</option>
                                        {NEXT_STATUSES[selected.status].map(s => <option key={s} value={s}>{STATUS_ICONS[s]} {s}</option>)}
                                    </select>
                                    <textarea rows={3} value={statusUpdate.comment} onChange={e => setStatusUpdate({ ...statusUpdate, comment: e.target.value })}
                                        placeholder="Nagarik ke liye comment (optional)..."
                                        className="w-full px-3 py-2 border border-amber-200 rounded-xl bg-amber-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none" />
                                    <button type="submit" disabled={updating}
                                        className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl transition disabled:opacity-60">
                                        {updating ? '⏳ Update ho raha...' : '✅ Status Update Karen'}
                                    </button>
                                </form>
                            )}
                            {!NEXT_STATUSES[selected.status] && (
                                <div className="text-center text-sm text-gray-400 border-t border-amber-50 pt-4">
                                    Yeh shikayat <strong className="text-gray-600">{selected.status}</strong> hai — aur update possible nahi hai.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
