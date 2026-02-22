import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:3000/api/v1';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_META = {
    'Open': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '📋', next: ['In Progress'] },
    'In Progress': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🔄', next: ['Resolved', 'Closed'] },
    'Resolved': { color: 'bg-green-100 text-green-800 border-green-200', icon: '✅', next: ['Closed'] },
    'Closed': { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: '🔒', next: [] },
};

const PRIORITY_META = {
    'Low': { color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
    'Medium': { color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-400' },
    'High': { color: 'bg-orange-50 text-orange-700', dot: 'bg-orange-400' },
    'Critical': { color: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
};

function getSLAInfo(slaDeadline, status) {
    if (['Resolved', 'Closed'].includes(status)) return { label: 'Completed', color: 'text-gray-400', urgency: 0 };
    const now = new Date();
    const diff = new Date(slaDeadline) - now;
    if (diff < 0) return { label: 'SLA Expired', color: 'text-red-600', urgency: 4 };
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (hours < 24) return { label: `${hours}h baki`, color: 'text-red-500', urgency: 3 };
    if (days <= 2) return { label: `${days}d baki`, color: 'text-orange-500', urgency: 2 };
    return { label: `${days}d baki`, color: 'text-green-600', urgency: 1 };
}

// ─── Navbar ────────────────────────────────────────────────────────────────────
function NavBar({ wardNo, complaintCount }) {
    const navigate = useNavigate();
    const name = (() => { try { return JSON.parse(atob(localStorage.getItem('token').split('.')[1])).name; } catch { return 'Adhikari'; } })();
    const logout = () => { localStorage.removeItem('token'); navigate('/login'); };
    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/50 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3 group cursor-default">
                    <span className="text-3xl bg-green-50 p-2 rounded-2xl group-hover:scale-110 transition-transform">🏛️</span>
                    <div>
                        <div className="font-black text-green-900 text-base leading-tight">Gram Panchayat</div>
                        <div className="text-[10px] text-amber-600 font-black uppercase tracking-widest">Ward {wardNo} • Official Portal</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-black text-gray-800">👨‍💼 {name}</span>
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">Active Adhikari</span>
                    </div>
                    <button onClick={logout} className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-600 hover:text-white transition-all shadow-sm">LOGOUT</button>
                </div>
            </div>
        </nav>
    );
}

// ─── SLA Timer Badge ──────────────────────────────────────────────────────────
function SLABadge({ slaDeadline, status }) {
    const sla = getSLAInfo(slaDeadline, status);
    return <span className={`text-xs font-bold ${sla.color}`}>⏱ {sla.label}</span>;
}

// ─── Complaint Card ───────────────────────────────────────────────────────────
function ComplaintCard({ comp, onClick }) {
    const sm = STATUS_META[comp.status] || STATUS_META['Open'];
    const pm = PRIORITY_META[comp.priority] || PRIORITY_META['Medium'];
    const sla = getSLAInfo(comp.slaDeadline, comp.status);
    const isOverdue = sla.urgency >= 3;

    return (
        <div onClick={() => onClick(comp)} className="bg-white rounded-[2rem] p-6 border border-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {isOverdue && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />}

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${sm.color}`}>{sm.icon} {comp.status}</span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider ${pm.color}`}>
                        {comp.priority}
                    </span>
                </div>

                <h3 className="font-black text-green-900 text-base mb-2 line-clamp-1 group-hover:text-amber-700 transition-colors uppercase tracking-tight">{comp.title}</h3>
                <p className="text-gray-500 text-xs line-clamp-2 mb-5 leading-relaxed font-medium italic">"{comp.description}"</p>

                <div className="flex justify-between items-center pt-4 border-t border-amber-50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-black text-amber-800">W{comp.wardNo}</div>
                        {comp.assignedStaff && <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">👷 {comp.assignedStaff.split(' ')[0]}</div>}
                    </div>
                    <SLABadge slaDeadline={comp.slaDeadline} status={comp.status} />
                </div>
            </div>
            {comp.isEscalated && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black p-1.5 rounded-bl-xl uppercase tracking-tighter animate-pulse shadow-lg">⚠️ Urgent</div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OfficialDashboard() {
    const [complaints, setComplaints] = useState([]);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('status'); // 'status' | 'assign' | 'escalate'

    // Modal form state
    const [statusForm, setStatusForm] = useState({ status: '', comment: '' });
    const [assignForm, setAssignForm] = useState({ staffName: '' });
    const [escalateForm, setEscalateForm] = useState({ reason: '' });
    const [submitting, setSubmitting] = useState(false);
    const [resPhotos, setResPhotos] = useState([]);

    const token = localStorage.getItem('token');
    const wardNo = (() => { try { return JSON.parse(atob(token.split('.')[1])).wardNo; } catch { return '—'; } })();
    const authH = { headers: { Authorization: `Bearer ${token}` } };

    const fetchComplaints = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/complaint/ward`, authH);
            setComplaints(res.data.data || []);
        } catch { toast.error('Shikayatein load nahi huin'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

    const openModal = (comp) => {
        setSelected(comp);
        setTab('status');
        setStatusForm({ status: '', comment: '' });
        setAssignForm({ staffName: comp.assignedStaff || '' });
        setEscalateForm({ reason: '' });
    };

    // ── Status Update ──────────────────────────────────────────────────────────
    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        if (!statusForm.status) return toast.error('Status chunein');
        setSubmitting(true);
        const data = new FormData();
        data.append('status', statusForm.status);
        data.append('comment', statusForm.comment);
        resPhotos.forEach(p => data.append('photos', p));

        try {
            await axios.patch(`${API}/complaint/${selected.id}/status`, data, {
                headers: { ...authH.headers, 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Status update ho gaya! ✅');
            setSelected(null); setResPhotos([]); fetchComplaints();
        } catch { toast.error('Update fail hua'); }
        finally { setSubmitting(false); }
    };

    // ── Field Staff Assign ─────────────────────────────────────────────────────
    const handleAssign = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.patch(`${API}/complaint/${selected.id}/assign`, assignForm, authH);
            toast.success(`${assignForm.staffName} ko assign kar diya! 👷`);
            setSelected(null); fetchComplaints();
        } catch { toast.error('Assign fail hua'); }
        finally { setSubmitting(false); }
    };

    // ── Escalate ──────────────────────────────────────────────────────────────
    const handleEscalate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.patch(`${API}/complaint/${selected.id}/escalate`, escalateForm, authH);
            toast.success('Shikayat escalate ho gayi! ⚠️');
            setSelected(null); fetchComplaints();
        } catch { toast.error('Escalate fail hua'); }
        finally { setSubmitting(false); }
    };

    // ── Counts ─────────────────────────────────────────────────────────────────
    const counts = complaints.reduce((a, c) => { a[c.status] = (a[c.status] || 0) + 1; return a; }, {});
    const escalatedCount = complaints.filter(c => c.isEscalated && !['Resolved', 'Closed'].includes(c.status)).length;
    const overdueCount = complaints.filter(c => getSLAInfo(c.slaDeadline, c.status).urgency >= 3).length;

    const filtered = filter === 'All' ? complaints :
        filter === 'Escalated' ? complaints.filter(c => c.isEscalated) :
            filter === 'Overdue' ? complaints.filter(c => getSLAInfo(c.slaDeadline, c.status).urgency >= 3) :
                complaints.filter(c => c.status === filter);

    // Sort by SLA urgency descending
    const sorted = [...filtered].sort((a, b) => getSLAInfo(b.slaDeadline, b.status).urgency - getSLAInfo(a.slaDeadline, a.status).urgency);

    if (loading) return (
        <div className="min-h-screen bg-[#fcf9f2] font-mukta flex flex-col">
            <NavBar wardNo={wardNo} complaintCount={0} />
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl animate-bounce mb-4">🏛️</div>
                    <p className="text-green-900 font-black uppercase tracking-widest text-xs">Panchayat Portal Loading...</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fcf9f2] font-mukta relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #064e3b 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <NavBar wardNo={wardNo} complaintCount={complaints.length} />
            <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-green-900 mb-2">Adhikari Panel ✨</h1>
                        <p className="text-gray-500 font-medium max-w-md italic">Ward ki shikayaton ka prabandhan aur samay par samadhan.</p>
                    </div>

                    {/* Compact Filter Bubble */}
                    <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-xl flex gap-1 overflow-x-auto max-w-full">
                        {[
                            { k: 'All', l: 'Sab' },
                            { k: 'Open', l: 'Open' },
                            { k: 'Escalated', l: '🚨 Escalated' },
                            { k: 'Overdue', l: '⏱ SLA' },
                        ].map(f => (
                            <button key={f.k} onClick={() => setFilter(f.k)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filter === f.k ? 'bg-green-700 text-white shadow-lg' : 'text-gray-500 hover:bg-white/50'}`}>
                                {f.l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Summary Cards ─────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { e: '📋', l: 'KUL SHIKAYATEIN', v: complaints.length, bg: 'bg-white', t: 'text-green-900' },
                        { e: '🔄', l: 'ACTION PENDING', v: (counts['Open'] || 0) + (counts['In Progress'] || 0), bg: 'bg-white', t: 'text-amber-600' },
                        { e: '🚨', l: 'ESCALATED', v: escalatedCount, bg: 'bg-red-50/50', t: 'text-red-700' },
                        { e: '⏱', l: 'SLA EXPIRED', v: overdueCount, bg: 'bg-orange-50/50', t: 'text-orange-700' },
                    ].map(s => (
                        <div key={s.l} className={`${s.bg} rounded-[2rem] p-6 border border-white shadow-xl group hover:scale-[1.02] transition-transform`}>
                            <div className="text-3xl mb-3">{s.e}</div>
                            <div className={`text-3xl font-black ${s.t}`}>{s.v}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{s.l}</div>
                        </div>
                    ))}
                </div>

                {/* ── Status Tabs Full ─────────────────────────── */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-4 custom-scrollbar">
                    {['In Progress', 'Resolved', 'Closed'].map(st => (
                        <button key={st} onClick={() => setFilter(st)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${filter === st ? 'bg-white text-green-800 border-green-200 shadow-md' : 'bg-transparent text-gray-400 border-transparent hover:text-gray-600'}`}>
                            <span className="w-2 h-2 rounded-full bg-current opacity-40" />
                            {st} ({counts[st] || 0})
                        </button>
                    ))}
                </div>

                {/* ── Cards Grid ───────────────────────────────── */}
                {sorted.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <div className="text-5xl mb-3">📭</div>
                        <p className="font-semibold">Is filter mein koi shikayat nahi</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {sorted.map(comp => <ComplaintCard key={comp.id} comp={comp} onClick={openModal} />)}
                    </div>
                )}
            </div>

            {/* ── Modal ────────────────────────────────────────── */}
            {selected && (
                <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50"
                    onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-amber-100 px-5 py-4 rounded-t-2xl">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0 mr-3">
                                    <h2 className="font-bold text-green-900 text-base leading-tight line-clamp-2">{selected.title}</h2>
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_META[selected.status]?.color}`}>
                                            {STATUS_META[selected.status]?.icon} {selected.status}
                                        </span>
                                        {selected.isEscalated && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">🚨 Escalated</span>}
                                        <SLABadge slaDeadline={selected.slaDeadline} status={selected.status} />
                                    </div>
                                </div>
                                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-800 text-2xl leading-none flex-shrink-0">×</button>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-amber-50/50 p-4 rounded-3xl border border-amber-100">
                                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block mb-1">Ward Area</span>
                                    <span className="text-sm font-black text-green-900 ml-1">No. {selected.wardNo}</span>
                                </div>
                                <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100">
                                    <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest block mb-1">Priority</span>
                                    <span className="text-sm font-black text-blue-900 ml-1">{selected.priority}</span>
                                </div>
                                <div className="bg-orange-50/50 p-4 rounded-3xl border border-orange-100 col-span-2">
                                    <span className="text-[10px] font-black text-orange-800 uppercase tracking-widest block mb-1">SLA Deadline</span>
                                    <span className="text-sm font-black text-orange-900 ml-1">{new Date(selected.slaDeadline).toLocaleDateString('hi-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 shadow-inner relative">
                                <span className="absolute -top-2 left-4 px-2 py-0.5 bg-white border border-gray-100 rounded-full text-[8px] font-black text-gray-400 uppercase">Description</span>
                                <p className="text-gray-600 text-sm leading-relaxed italic">"{selected.description}"</p>
                            </div>

                            {/* Action Tabs */}
                            <div className="border-t border-amber-100 pt-4">
                                <div className="flex gap-1 bg-amber-50 p-1 rounded-xl mb-4">
                                    {[
                                        { k: 'status', l: '🔄 Status' },
                                        { k: 'assign', l: '👷 Staff Assign' },
                                        {
                                            k: 'escalate', l: '⚠️ Escalate',
                                            disabled: selected.isEscalated || ['Resolved', 'Closed'].includes(selected.status)
                                        },
                                    ].map(t => (
                                        <button key={t.k} onClick={() => !t.disabled && setTab(t.k)} disabled={t.disabled}
                                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t.k ? 'bg-white shadow text-green-800' : 'text-gray-400 hover:text-gray-600'} ${t.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                            {t.l}
                                        </button>
                                    ))}
                                </div>

                                {/* Status Update */}
                                {tab === 'status' && (
                                    <form onSubmit={handleStatusUpdate} className="space-y-3">
                                        {STATUS_META[selected.status]?.next.length > 0 ? (
                                            <>
                                                {/* Visual workflow */}
                                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                                    <span className={`px-2 py-1 rounded-lg font-bold ${STATUS_META[selected.status]?.color}`}>{selected.status}</span>
                                                    <span>→</span>
                                                    {STATUS_META[selected.status]?.next.map(s => (
                                                        <span key={s} className={`px-2 py-1 rounded-lg font-bold ${STATUS_META[s]?.color}`}>{s}</span>
                                                    ))}
                                                </div>
                                                <select required value={statusForm.status} onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                                                    className="w-full px-3 py-2.5 border border-amber-200 rounded-xl bg-amber-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                                                    <option value="">-- Naya status chunein --</option>
                                                    {STATUS_META[selected.status]?.next.map(s => <option key={s} value={s}>{STATUS_META[s]?.icon} {s}</option>)}
                                                </select>
                                                <textarea rows={2} value={statusForm.comment} onChange={e => setStatusForm({ ...statusForm, comment: e.target.value })}
                                                    placeholder="Nagarik ke liye comment (optional)..."
                                                    className="w-full px-3 py-2 border border-amber-200 rounded-xl bg-amber-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none" />

                                                {/* Phase 4: Resolution Photo */}
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">📸 Resolution Photos (optional)</label>
                                                    <label className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-amber-200 rounded-xl bg-amber-50/30 text-xs text-amber-600 cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition">
                                                        {resPhotos.length > 0 ? `✅ ${resPhotos.length} photo(s)` : '📸 Proof/Photo upload karein'}
                                                        <input type="file" multiple accept="image/*" className="hidden" onChange={e => setResPhotos(Array.from(e.target.files))} />
                                                    </label>
                                                </div>

                                                <button type="submit" disabled={submitting} className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl transition disabled:opacity-60 text-sm">
                                                    {submitting ? '⏳ Update ho raha...' : '✅ Status Update Karen'}
                                                </button>
                                            </>
                                        ) : (
                                            <p className="text-center text-sm text-gray-400 py-4">Is shikayat ka status <strong className="text-gray-600">{selected.status}</strong> hai — aur update nahi ho sakta.</p>
                                        )}
                                    </form>
                                )}

                                {/* Assign Staff */}
                                {tab === 'assign' && (
                                    <form onSubmit={handleAssign} className="space-y-3">
                                        <p className="text-xs text-gray-500">Field worker ka naam darj karein — status apne aap "In Progress" ho jaayega.</p>
                                        <input type="text" required value={assignForm.staffName} onChange={e => setAssignForm({ staffName: e.target.value })}
                                            placeholder="Jaise: Ramesh Kumar (9876543210)"
                                            className="w-full px-3 py-2.5 border border-amber-200 rounded-xl bg-amber-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                                        <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition disabled:opacity-60 text-sm">
                                            {submitting ? '⏳ Assign ho raha...' : '👷 Field Staff Assign Karen'}
                                        </button>
                                    </form>
                                )}

                                {/* Escalate */}
                                {tab === 'escalate' && (
                                    <form onSubmit={handleEscalate} className="space-y-3">
                                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-700">
                                            ⚠️ Escalation se yeh shikayat <strong>Admin ki priority list</strong> mein chali jaayegi.
                                        </div>
                                        <textarea rows={3} value={escalateForm.reason} onChange={e => setEscalateForm({ reason: e.target.value })}
                                            placeholder="Escalation ka karan likhein (optional)..."
                                            className="w-full px-3 py-2 border border-red-200 rounded-xl bg-red-50/50 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm resize-none" />
                                        <button type="submit" disabled={submitting} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition disabled:opacity-60 text-sm">
                                            {submitting ? '⏳...' : '🚨 Escalate Karen'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
