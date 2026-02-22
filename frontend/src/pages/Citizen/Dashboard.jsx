import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
    'Open': 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Resolved': 'bg-green-100 text-green-800',
    'Closed': 'bg-gray-100 text-gray-600',
};

const API = 'http://localhost:3000/api/v1';

function NavBar() {
    const navigate = useNavigate();
    const name = (() => { try { return JSON.parse(atob(localStorage.getItem('token').split('.')[1])).name; } catch { return 'Nagarik'; } })();
    const logout = () => { localStorage.removeItem('token'); navigate('/login'); };
    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-amber-100 shadow-sm">
            <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🏘️</span>
                    <div>
                        <div className="font-bold text-green-800 text-sm leading-tight">Gram Panchayat</div>
                        <div className="text-xs text-amber-600">Nagarik Portal</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">🙏 {name}</span>
                    <button onClick={logout} className="text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">Logout</button>
                </div>
            </div>
        </nav>
    );
}

export default function CitizenDashboard() {
    const [view, setView] = useState('submit');
    const [formData, setFormData] = useState({ title: '', description: '', wardNo: '' });
    const [files, setFiles] = useState([]);
    const [geoTag, setGeoTag] = useState(null);
    const [geoLoading, setGeoLoading] = useState(false);
    const [trackingId, setTrackingId] = useState('');
    const [complaint, setComplaint] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [tracking, setTracking] = useState(false);
    const [successId, setSuccessId] = useState('');

    const token = localStorage.getItem('token');
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    const getLocation = () => {
        if (!navigator.geolocation) return toast.error('Geolocation supported nahi hai');
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => { setGeoTag({ lat: pos.coords.latitude, lng: pos.coords.longitude }); toast.success('📍 Location tag ho gayi!'); setGeoLoading(false); },
            () => { toast.error('Location nahi mili. Permission dein.'); setGeoLoading(false); }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('wardNo', formData.wardNo);
        if (geoTag) data.append('geoTag', JSON.stringify(geoTag));
        files.forEach(f => data.append('photos', f));
        try {
            const res = await axios.post(`${API}/complaint/submit`, data, authHeader);
            const id = res.data.data.trackingId;
            setSuccessId(id);
            setFormData({ title: '', description: '', wardNo: '' });
            setFiles([]); setGeoTag(null);
            toast.success('Shikayat darj ho gayi! 🎉');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission fail hua');
        } finally { setSubmitting(false); }
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        setTracking(true);
        setComplaint(null);
        try {
            const res = await axios.get(`${API}/complaint/track/${trackingId}`);
            setComplaint(res.data.data);
        } catch {
            toast.error('Shikayat nahi mili. ID check karein.');
        } finally { setTracking(false); }
    };

    return (
        <div className="min-h-screen bg-[#f9f3e8] font-mukta">
            <NavBar />
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-amber-100 mb-6 gap-1">
                    {[['submit', '📝 Shikayat Daalo'], ['track', '🔍 Status Track Karo']].map(([v, l]) => (
                        <button key={v} onClick={() => { setView(v); setSuccessId(''); }}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${view === v ? 'bg-green-700 text-white shadow' : 'text-gray-500 hover:text-green-700'}`}>
                            {l}
                        </button>
                    ))}
                </div>

                {/* Success Banner */}
                {successId && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 mb-6">
                        <div className="flex items-start gap-3">
                            <span className="text-3xl">🎉</span>
                            <div>
                                <h3 className="font-bold text-green-800">Shikayat Darj Ho Gayi!</h3>
                                <p className="text-sm text-green-700 mt-1">Aapka Tracking ID hai:</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <code className="bg-white border border-green-300 text-green-800 font-mono font-bold px-3 py-1.5 rounded-lg text-sm">{successId}</code>
                                    <button onClick={() => { navigator.clipboard.writeText(successId); toast.success('Copied!'); }}
                                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">Copy</button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">⚠️ Isse sambhaal ke rakho — Track tab mein paste karke status dekh sakte ho</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Form */}
                {view === 'submit' && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 space-y-5">
                        <div>
                            <h2 className="text-xl font-bold text-green-900">Nayi Shikayat Darj Karein</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Apni samasya ka vivaran bharen</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-green-800 mb-1">Samasya ka Shishak (Title) *</label>
                            <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Jaise: Ward 5 mein sadak toot gayi"
                                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-green-800 mb-1">Poora Vivaran (Description) *</label>
                            <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Samasya ka detail mein varnan karein — kab se hai, kahan hai, kitni gambhir hai..."
                                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-green-800 mb-1">Ward Number *</label>
                            <input type="text" required value={formData.wardNo} onChange={e => setFormData({ ...formData, wardNo: e.target.value })}
                                placeholder="Jaise: 5"
                                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-green-800 mb-1">📍 Location Tag</label>
                                <button type="button" onClick={getLocation} disabled={geoLoading}
                                    className={`w-full py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${geoTag ? 'bg-green-50 border-green-400 text-green-700' : 'bg-white border-amber-200 text-gray-600 hover:border-green-400'}`}>
                                    {geoLoading ? '⏳ Location le raha...' : geoTag ? `✅ ${geoTag.lat.toFixed(4)}, ${geoTag.lng.toFixed(4)}` : '📍 Location Tag Karen'}
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-green-800 mb-1">📸 Photo Upload (max 5)</label>
                                <label className="flex items-center justify-center w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 text-sm text-amber-700 cursor-pointer hover:border-green-400 transition-all">
                                    {files.length > 0 ? `✅ ${files.length} photo(s) chunen` : '📸 Photo chunen'}
                                    <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files))} className="hidden" />
                                </label>
                            </div>
                        </div>
                        <button type="submit" disabled={submitting}
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-60">
                            {submitting ? '⏳ Darj ho raha hai...' : '🚀 Shikayat Submit Karen'}
                        </button>
                    </form>
                )}

                {/* Track Form */}
                {view === 'track' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
                        <h2 className="text-xl font-bold text-green-900 mb-1">Apni Shikayat Track Karein</h2>
                        <p className="text-xs text-gray-500 mb-5">Submit karte waqt jo ID mili thi woh enter karein</p>
                        <form onSubmit={handleTrack} className="flex gap-2 mb-6">
                            <input type="text" required value={trackingId} onChange={e => setTrackingId(e.target.value)}
                                placeholder="Jaise: COMP-1234567890-123"
                                className="flex-1 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                            <button type="submit" disabled={tracking}
                                className="bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-800 transition disabled:opacity-60 text-sm">
                                {tracking ? '...' : '🔍 Track'}
                            </button>
                        </form>

                        {complaint && (
                            <div className="border border-amber-100 rounded-xl overflow-hidden">
                                <div className="bg-amber-50 p-4 flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-green-900 text-lg">{complaint.title}</h3>
                                        <code className="text-xs text-gray-500 font-mono">{complaint.trackingId}</code>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[complaint.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {complaint.status}
                                    </span>
                                </div>
                                <div className="p-4 space-y-4">
                                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{complaint.description}</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                        <div className="bg-blue-50 p-2.5 rounded-lg"><span className="text-gray-400 block">Ward</span><span className="font-bold text-blue-800">No. {complaint.wardNo}</span></div>
                                        <div className="bg-orange-50 p-2.5 rounded-lg"><span className="text-gray-400 block">SLA Deadline</span><span className="font-bold text-orange-700">{new Date(complaint.slaDeadline).toLocaleDateString('hi-IN')}</span></div>
                                        {complaint.isEscalated && <div className="bg-red-50 p-2.5 rounded-lg"><span className="text-gray-400 block">Status</span><span className="font-bold text-red-700">⚠️ Escalated</span></div>}
                                    </div>
                                    {complaint.Histories?.length > 0 && (
                                        <div>
                                            <h4 className="font-bold text-green-800 text-sm mb-3">📜 Timeline</h4>
                                            <div className="space-y-2">
                                                {complaint.Histories.map((h, i) => (
                                                    <div key={i} className="flex gap-3 text-sm">
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1 shrink-0" />
                                                            {i < complaint.Histories.length - 1 && <div className="w-0.5 bg-green-200 flex-1 mt-1" />}
                                                        </div>
                                                        <div className="pb-3">
                                                            <span className="font-semibold text-green-800">{h.event}</span>
                                                            <p className="text-gray-400 text-xs">{new Date(h.createdAt).toLocaleString('hi-IN')}</p>
                                                            {h.comment && <p className="italic text-gray-500 mt-0.5 text-xs">"{h.comment}"</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
