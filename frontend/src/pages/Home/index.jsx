import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const faqs = [
    { q: 'Koi bhi register kar sakta hai?', a: 'Haan, koi bhi nagarik register karke apni ward ki samasya darj kar sakta hai.' },
    { q: 'Shikayat track kaise karein?', a: 'Submit karne ke baad ek unique ID milega, usi ID se status track karein.' },
    { q: 'Agar SLA pe kuch nahi hua?', a: 'System auto-escalate karega aur senior adhikari ko alert milega.' },
];

export default function Home() {
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="min-h-screen font-mukta bg-[#f9f3e8]">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-amber-100 shadow-sm">
                <div className="max-w-6xl mx-auto px-5 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🏘️</span>
                        <div>
                            <div className="font-bold text-green-800 text-base leading-tight">Gram Panchayat</div>
                            <div className="text-xs text-amber-600">Digital Shikayat Pranali</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="text-green-800 font-semibold text-sm hover:text-amber-700 transition">Login</Link>
                        <Link to="/register" className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 shadow transition">
                            Register Karen →
                        </Link>
                    </div>
                </div>
            </nav>

            {/* 🌾 Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-amber-700 text-white">
                {/* Decorative dots */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur-sm">
                        <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                        Digital India — Gram Vikas
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                        Apne Gaon Ki Baat,<br />
                        <span className="text-amber-300">Sarkar Tak Pahunchao 🌿</span>
                    </h1>
                    <p className="text-green-100 text-lg max-w-2xl mx-auto mb-8">
                        Sadak, paani, bijli — kisi bhi samasya ko photo aur location ke saath sirf 2 minute mein darj karein.
                        Status real-time track karein. Badlav dekhein.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register"
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-8 rounded-xl text-lg shadow-xl transition-all transform hover:scale-105">
                            📝 Shikayat Darj Karein
                        </Link>
                        <Link to="/login"
                            className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3.5 px-8 rounded-xl text-lg border border-white/40 transition-all backdrop-blur-sm">
                            🔑 Login Karen
                        </Link>
                    </div>
                    {/* Trust badges */}
                    <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-green-200">
                        <span>✅ Free Service</span>
                        <span>✅ Photo Upload</span>
                        <span>✅ GPS Location</span>
                        <span>✅ Real-time Tracking</span>
                    </div>
                </div>

                {/* Wave */}
                <svg viewBox="0 0 1440 60" className="w-full" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,30 C400,60 1040,0 1440,30 L1440,60 L0,60 Z" fill="#f9f3e8" />
                </svg>
            </section>

            {/* 📊 Stats Row */}
            <section className="py-8 bg-[#f9f3e8]">
                <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { n: '42+', l: 'Wards', bg: 'bg-amber-50', c: 'text-amber-700', e: '🏘️' },
                        { n: '1,200+', l: 'Shikayatein Suli', bg: 'bg-green-50', c: 'text-green-700', e: '✅' },
                        { n: '5 Din', l: 'Avg Resolution', bg: 'bg-blue-50', c: 'text-blue-700', e: '⏱️' },
                        { n: '98%', l: 'Satisfaction', bg: 'bg-orange-50', c: 'text-orange-700', e: '⭐' },
                    ].map(s => (
                        <div key={s.l} className={`${s.bg} rounded-xl p-4 text-center border border-white shadow-sm`}>
                            <div className="text-2xl mb-1">{s.e}</div>
                            <div className={`text-2xl font-bold ${s.c}`}>{s.n}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{s.l}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 🔁 How it Works */}
            <section className="py-14 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <p className="text-center text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">Kaise Kaam Karta Hai?</p>
                    <h2 className="text-3xl font-bold text-center text-green-900 mb-10">4 Aasaan Steps</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { n: '1', e: '📝', t: 'Register Karein', d: 'Apna naam, ward number aur email se account banayein' },
                            { n: '2', e: '📸', t: 'Shikayat Daalo', d: 'Photo, GPS location aur description ke saath submit karein' },
                            { n: '3', e: '🔍', t: 'ID Note Karein', d: 'Unique tracking ID milega — isko sambhaal ke rakho' },
                            { n: '4', e: '✅', t: 'Status Dekhein', d: 'Open → In Progress → Resolved — real-time update' },
                        ].map(item => (
                            <div key={item.n} className="relative bg-[#f9f3e8] rounded-2xl p-5 border border-amber-100 hover:shadow-md transition-all">
                                <div className="w-8 h-8 rounded-full bg-green-700 text-white text-xs font-bold flex items-center justify-center mb-3">{item.n}</div>
                                <div className="text-3xl mb-2">{item.e}</div>
                                <h3 className="font-bold text-green-800 mb-1">{item.t}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 🗒️ Feature Details */}
            <section className="py-14 px-6 bg-[#f9f3e8]">
                <div className="max-w-5xl mx-auto">
                    <p className="text-center text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">Facilities</p>
                    <h2 className="text-3xl font-bold text-center text-green-900 mb-10">Is Pranali Mein Kya Hai?</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { e: '📸', t: 'Photo Proof', d: 'Samasya ki photo upload karein taaki adhikari bhi sambhavit samasya samjhein' },
                            { e: '📍', t: 'GPS Location', d: 'Dalte samay apni location auto-detect karein ya manually add karein' },
                            { e: '🔑', t: 'Unique ID Tracking', d: 'Har shikayat ka ek alag ID hota hai — kabhi bhi track kar sakein' },
                            { e: '⏱️', t: 'SLA Timer', d: '7-din ki deadline; breach hone pe auto-escalation senior adhikari ko' },
                            { e: '👨‍💼', t: 'Role-Based Access', d: 'Nagarik, Adhikari aur Admin ke alag-alag dashboards' },
                            { e: '📊', t: 'Analytics', d: 'Total, pending, resolved — admin ko poora system overview milta hai' },
                        ].map(f => (
                            <div key={f.t} className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                                <div className="text-4xl mb-3">{f.e}</div>
                                <h3 className="font-bold text-green-800 text-lg mb-2">{f.t}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{f.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 🙋 Roles Section */}
            <section className="py-14 px-6 bg-green-800 text-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-10">Kaun Kaun Hai Is Pranali Mein?</h2>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {[
                            { e: '👨‍🌾', r: 'Nagarik', p: 'Shikayat darj karein, photo aur location ke saath. Track ID se status dekhein.', c: 'bg-amber-500' },
                            { e: '👨‍💼', r: 'Panchayat Adhikari', p: 'Ward ki shikayatein dekho, assign karo aur status update karo. SLA monitor karo.', c: 'bg-green-600' },
                            { e: '🏛️', r: 'Admin', p: 'Poore system ka analytics dekho. SLA breach aur escalation manage karo.', c: 'bg-orange-500' },
                        ].map(role => (
                            <div key={role.r} className="bg-white/10 rounded-2xl p-6 border border-white/20 text-center hover:bg-white/20 transition-all">
                                <div className={`w-14 h-14 ${role.c} rounded-full flex items-center justify-center text-2xl mx-auto mb-4`}>{role.e}</div>
                                <h3 className="font-bold text-xl mb-2">{role.r}</h3>
                                <p className="text-green-200 text-sm leading-relaxed">{role.p}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ❓ FAQ */}
            <section className="py-14 px-6 bg-white">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-center text-green-900 mb-8">Aksar Puchhe Gaye Sawaal</h2>
                    {faqs.map((faq, i) => (
                        <div key={i} className="border-b border-amber-100 py-4">
                            <button className="w-full flex justify-between items-center text-left font-semibold text-green-800" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                {faq.q}
                                <span className="text-amber-500 text-xl ml-4">{openFaq === i ? '−' : '+'}</span>
                            </button>
                            {openFaq === i && <p className="mt-2 text-gray-500 text-sm leading-relaxed">{faq.a}</p>}
                        </div>
                    ))}
                </div>
            </section>

            {/* 🚀 CTA */}
            <section className="py-16 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-center">
                <h2 className="text-3xl font-bold mb-3">Abhi Shikayat Darj Karein 🌿</h2>
                <p className="text-amber-100 mb-6 text-sm">Free, Fast, aur Transparent — Gram Panchayat ki awaaz online</p>
                <Link to="/register" className="inline-block bg-white text-amber-700 font-bold py-3 px-10 rounded-xl text-lg shadow-lg hover:scale-105 transition-transform">
                    Register Karen →
                </Link>
            </section>

            {/* Footer */}
            <footer className="bg-green-900 text-green-300 text-center py-6 px-4 text-sm">
                <p>🏡 Gram Panchayat Digital Shikayat Pranali &copy; {new Date().getFullYear()} &nbsp;|&nbsp; Digital India Initiative</p>
            </footer>
        </div>
    );
}
