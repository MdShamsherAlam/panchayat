import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Leaflet marker fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setGeoTag({ lat, lng });
                detectWard(lat, lng);
                toast.success('📍 Location tag ho gayi!');
                setGeoLoading(false);
            },
            () => { toast.error('Location nahi mili. Permission dein.'); setGeoLoading(false); }
        );
    };

    // Phase 2/3: Mock Ward Detection from Coordinates
    const detectWard = (lat, lng) => {
        // Mock logic: Ward 5 if lat > 0, else Ward 10 (just to demonstrate auto-detect)
        const ward = lat > 15 ? '5' : '10';
        setFormData(prev => ({ ...prev, wardNo: ward }));
        toast.success(`🧭 Auto-detected: Ward No. ${ward}`);
    };

    function LocationMarker() {
        useMapEvents({
            click(e) {
                setGeoTag(e.latlng);
                detectWard(e.latlng.lat, e.latlng.lng);
            },
        });
        return geoTag === null ? null : (
            <Marker position={geoTag} />
        );
    }

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

    const handleReview = async (action, reason = '') => {
        setSubmitting(true);
        try {
            await axios.patch(`${API}/complaint/track/${complaint.trackingId}/review`, { action, reason }, authHeader);
            toast.success(action === 'accept' ? 'Shikayat Closed! ✅' : 'Shikayat Reopen ho gayi! ⚠️');
            // Refresh complaint data
            const res = await axios.get(`${API}/complaint/track/${complaint.trackingId}`);
            setComplaint(res.data.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action fail hua');
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
        <div className="min-h-screen bg-[#fcf9f2] font-mukta relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #064e3b 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <NavBar />

            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-green-900 mb-2">Nagarik Suvidha 🌿</h1>
                    <p className="text-gray-500 font-medium italic">Sarkari seva, ab aapke dwar aur digital</p>
                </div>

                {/* Glass Tabs */}
                <div className="flex bg-white/50 backdrop-blur-md rounded-2xl p-1.5 shadow-xl border border-white/50 mb-10 gap-2">
                    {[['submit', '📝 Shikayat Daalo'], ['track', '🔍 Status Track Karo']].map(([v, l]) => (
                        <button key={v} onClick={() => { setView(v); setSuccessId(''); }}
                            className={`flex-1 py-3.5 rounded-xl text-sm font-black transition-all ${view === v ? 'bg-green-700 text-white shadow-lg scale-[1.02]' : 'text-gray-500 hover:text-green-700 hover:bg-white/50'}`}>
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
                    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white p-8 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="border-b border-amber-50 pb-6">
                            <h2 className="text-2xl font-black text-green-900">Nayi Shikayat Darj Karein</h2>
                            <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mt-1">Grievance Registration Form</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2 text-xs font-black text-green-800 uppercase tracking-wider mb-2 ml-1">Samasya ka Shishak (Title) *</label>
                                    <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Jaise: Ward 5 mein sadak toot gayi"
                                        className="w-full px-5 py-4 rounded-2xl border border-amber-100 bg-amber-50/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm font-medium" />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-black text-green-800 uppercase tracking-wider mb-2 ml-1">Ward Number *</label>
                                    <input type="text" required value={formData.wardNo} onChange={e => setFormData({ ...formData, wardNo: e.target.value })}
                                        placeholder="Jaise: 5"
                                        className="w-full px-5 py-4 rounded-2xl border border-amber-100 bg-amber-50/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm font-medium" />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-green-800 uppercase tracking-wider mb-2 ml-1">Poora Vivaran (Description) *</label>
                                <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Samasya ka detail mein varnan karein — kab se hai, kahan hai, kitni gambhir hai..."
                                    className="w-full px-5 py-4 rounded-2xl border border-amber-100 bg-amber-50/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm font-medium resize-none shadow-inner" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-black text-green-800 uppercase tracking-wider mb-2 ml-1">📍 Location Tag & Map Pin *</label>
                                    <div className="space-y-3">
                                        <button type="button" onClick={getLocation} disabled={geoLoading}
                                            className={`w-full py-4 px-5 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${geoTag ? 'bg-green-50 border-green-500 text-green-800' : 'bg-white border-dashed border-amber-200 text-gray-400 hover:border-green-500 hover:text-green-700'}`}>
                                            {geoLoading ? '⏳ Tag ho raha...' : geoTag ? `✅ Tagged: ${geoTag.lat.toFixed(4)}, ${geoTag.lng.toFixed(4)}` : '📍 GPS Tagging'}
                                        </button>

                                        {/* Leaflet Map Integration (Phase 2) */}
                                        <div className="h-48 w-full rounded-2xl overflow-hidden border-2 border-amber-100 shadow-inner relative z-0">
                                            <MapContainer center={[20.5937, 78.9629]} zoom={4} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                                                <TileLayer
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                <LocationMarker />
                                            </MapContainer>
                                            <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[8px] font-black text-amber-800 border border-amber-100 uppercase tracking-tighter">
                                                👆 Click on Map to manual Pin
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-black text-green-800 uppercase tracking-wider mb-2 ml-1">📸 Photo Proof</label>
                                    <label className="flex items-center justify-center w-full py-4 px-5 rounded-2xl border-2 border-dashed border-amber-200 bg-white text-sm font-bold text-gray-400 cursor-pointer hover:border-green-500 hover:text-green-700 transition-all">
                                        {files.length > 0 ? `✅ ${files.length} Photo(s) Chunen` : '📸 Upload Photos'}
                                        <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files))} className="hidden" />
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button type="submit" disabled={submitting}
                                    className="w-full bg-green-700 hover:bg-green-800 text-white font-black py-5 rounded-[1.5rem] shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-60 text-lg flex items-center justify-center gap-2">
                                    {submitting ? '⏳ Darj ho raha hai...' : '🚀 Shikayat Submit Karen'}
                                </button>
                                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">Safe & Secure Digital India Initiative</p>
                            </div>
                        </form>
                    </div>
                )}

                {/* Track Form */}
                {view === 'track' && (
                    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white p-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="border-b border-amber-50 pb-6 mb-8">
                            <h2 className="text-2xl font-black text-green-900">Apni Shikayat Track Karein</h2>
                            <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mt-1">Grievance Tracking System</p>
                        </div>

                        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 mb-10">
                            <input type="text" required value={trackingId} onChange={e => setTrackingId(e.target.value)}
                                placeholder="Jaise: COMP-1234567890-123"
                                className="flex-1 px-5 py-4 rounded-2xl border border-amber-100 bg-amber-50/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white text-sm font-medium shadow-inner transition-all" />
                            <button type="submit" disabled={tracking}
                                className="bg-green-700 text-white px-10 py-4 rounded-2xl font-black hover:bg-green-800 transition-all shadow-xl disabled:opacity-60 text-sm transform hover:-translate-y-1 active:translate-y-0">
                                {tracking ? '⏳...' : '🔍 Track Detail'}
                            </button>
                        </form>

                        {complaint && (
                            <div className="space-y-6 animate-in zoom-in-95 duration-300">
                                {/* Status Header Card */}
                                <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                                    <div className="relative z-10 flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-300 mb-1">Shikayat Status</p>
                                            <h3 className="text-2xl font-black">{complaint.title}</h3>
                                            <code className="text-xs text-green-200/60 font-mono mt-1 block">ID: {complaint.trackingId}</code>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg ${STATUS_COLORS[complaint.status] || 'bg-white/20 text-white'}`}>
                                            {complaint.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="bg-amber-50/50 p-4 rounded-3xl border border-amber-100 shadow-sm">
                                        <span className="text-[10px] font-black text-amber-800 uppercase block mb-1">Ward Area</span>
                                        <span className="text-lg font-black text-green-900 ml-1">No. {complaint.wardNo}</span>
                                    </div>
                                    <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100 shadow-sm">
                                        <span className="text-[10px] font-black text-blue-800 uppercase block mb-1">SLA Deadline</span>
                                        <span className="text-sm font-black text-blue-900 ml-1">{new Date(complaint.slaDeadline).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short' })}</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center">
                                        {complaint.isEscalated ? (
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-red-200">🚨 Escalated</span>
                                        ) : (
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">✅ On Time</span>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="bg-white rounded-3xl p-6 border border-amber-50 shadow-inner">
                                    <p className="text-gray-600 text-sm leading-relaxed italic">"{complaint.description}"</p>
                                </div>

                                {/* Resolution Review Action */}
                                {complaint.status === 'Resolved' && (
                                    <div className="bg-amber-50 rounded-[2rem] p-8 border-2 border-dashed border-amber-300 space-y-4 animate-bounce-short">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">🎯</span>
                                            <div>
                                                <h4 className="font-black text-amber-900 leading-tight">Samadhan ka Review Karein</h4>
                                                <p className="text-xs text-amber-700 font-medium">Kya aap is samadhan se santusht hain?</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => handleReview('accept')} disabled={submitting}
                                                className="flex-1 bg-green-700 text-white py-3 rounded-2xl font-black text-sm hover:bg-green-800 transition shadow-xl hover:-translate-y-1">
                                                ✅ Haan, Close Karen
                                            </button>
                                            <button onClick={() => { const r = prompt('Reject karne ka kaaran bataiye:'); if (r) handleReview('reject', r); }} disabled={submitting}
                                                className="flex-1 bg-white text-red-600 border border-red-100 py-3 rounded-2xl font-black text-sm hover:bg-red-50 transition shadow-md">
                                                ❌ Nahi, Reopen Karen
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Timeline */}
                                {complaint.Histories?.length > 0 && (
                                    <div className="pt-4 px-2">
                                        <h4 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                                            <span className="w-8 h-[1px] bg-gray-200" /> Lifecycle Timeline
                                        </h4>
                                        <div className="space-y-6">
                                            {complaint.Histories.map((h, i) => (
                                                <div key={i} className="flex gap-4 group">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-4 h-4 rounded-full bg-green-700 ring-4 ring-green-100 shrink-0 z-10" />
                                                        {i < complaint.Histories.length - 1 && <div className="w-[2px] bg-green-100 flex-1 my-1" />}
                                                    </div>
                                                    <div className="pb-4">
                                                        <p className="font-black text-green-900 text-sm leading-none mb-1">{h.event}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(h.createdAt).toLocaleString('hi-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                        {h.comment && <p className="italic text-gray-500 mt-2 text-xs bg-gray-50 p-2 rounded-xl border border-gray-100 w-fit">"{h.comment}"</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

