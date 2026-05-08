/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Vote, 
  BarChart3, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  LogIn,
  LogOut,
  Info,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

ChartJS.register(ArcElement, Tooltip, Legend);

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Candidate {
  no: number;
  nama: string;
  visi: string;
  misi: string;
  foto: string;
  suara: number;
}

interface Log {
  waktu: string;
  nama: string;
  tps: string;
  metode: string;
  status: string;
}

interface Stats {
  totalVoters: number;
  totalCandidates: number;
  suaraMasuk: number;
  partisipasi: string;
}

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [nikInput, setNikInput] = useState("");
  const [showLogin, setShowLogin] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      setCandidates(data.candidates);
      setLogs(data.logs);
      setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik: nikInput })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.voter);
        setIsLoggedIn(true);
        setShowLogin(false);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
    }
  };

  const handleVote = async (candidateNo: number) => {
    if (!user) return;
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik: user.nik, candidateNo })
      });
      if (res.ok) {
        alert("Suara Anda berhasil dikirim!");
        setIsLoggedIn(false);
        setUser(null);
        setNikInput("");
        setShowLogin(true);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      alert("Gagal mengirim suara.");
    }
  };

  const chartData = {
    labels: candidates.map(c => c.nama),
    datasets: [
      {
        data: candidates.map(c => c.suara),
        backgroundColor: ['#800000', '#D91E18', '#EE4B2B'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false
      }
    },
    cutout: '70%'
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-maroon-800 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-maroon-900 leading-none">E-Voting Ketua RT</h1>
              <p className="text-xs text-gray-500 font-medium tracking-widest mt-1 uppercase">Transparan • Cepat • Aman</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8 font-medium text-sm">
            <a href="#" className="text-maroon-700 border-b-2 border-maroon-700 pb-1">Beranda</a>
            <a href="#" className="hover:text-maroon-700 transition">Kandidat</a>
            <a href="#" className="hover:text-maroon-700 transition">Jadwal</a>
            <a href="#" className="hover:text-maroon-700 transition">Hasil Sementara</a>
            <a href="#" className="hover:text-maroon-700 transition">Data Pemilih</a>
            <button className="bg-maroon-800 text-white px-5 py-2.5 rounded-md flex items-center gap-2 hover:bg-maroon-900 transition shadow-sm">
              <LogIn size={16} /> Login Admin
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Hero / Welcome */}
            <section className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row items-center">
              <div className="p-8 md:p-12 flex-1 space-y-4">
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                  Pemilihan Ketua <br className="hidden md:block"/> RT 2026
                </h2>
                <p className="text-gray-500 text-lg max-w-lg leading-relaxed">
                  Gunakan hak suara Anda untuk memilih Ketua RT terbaik untuk masa depan lingkungan kita.
                </p>
                {!isLoggedIn && (
                  <div className="pt-4 flex items-center gap-4 text-maroon-800 font-semibold italic text-sm">
                    <ShieldCheck size={18} />
                    Sistem ini aman dan terenkripsi.
                  </div>
                )}
                {isLoggedIn && (
                  <div className="pt-4 text-maroon-800 bg-red-50 px-4 py-2 rounded-lg inline-block font-semibold">
                    Selamat datang, {user.nama}! Silakan gunakan hak suara Anda.
                  </div>
                )}
              </div>
              <div className="hidden md:block w-1/3 h-full min-h-[300px]">
                <img 
                  src="https://images.unsplash.com/photo-1540910419316-aaec925697c4?w=800&q=80" 
                  alt="Election Box" 
                  className="w-full h-full object-cover grayscale opacity-20"
                />
              </div>
            </section>

            {/* Stats Cards */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Pemilih", value: stats?.totalVoters || 0, icon: Users, sub: "DPT Tetap" },
                { label: "Kandidat", value: stats?.totalCandidates || 0, icon: UserCheck, sub: "Calon Ketua RT" },
                { label: "Suara Masuk", value: stats?.suaraMasuk || 0, icon: Vote, sub: "Update Real-time" },
                { label: "Partisipasi", value: stats?.partisipasi || "0%", icon: BarChart3, sub: "Dari Total Pemilih" },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-50 text-maroon-700 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-none mb-1">{item.label}</h4>
                    <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{item.value}</div>
                    <p className="text-[10px] text-gray-500">{item.sub}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* Candidates Selection */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <Users className="text-maroon-800" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Calon Ketua RT</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {candidates.map((candidate) => (
                  <div key={candidate.no} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition">
                    <div className="relative h-64 overflow-hidden">
                      <img src={candidate.foto} alt={candidate.nama} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute top-4 left-4 w-8 h-8 bg-maroon-800 text-white flex items-center justify-center font-bold rounded shadow-lg">
                        {candidate.no}
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{candidate.nama}</h4>
                        <div className="h-1 w-12 bg-maroon-800 mt-1"></div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Visi</h5>
                        <p className="text-sm text-gray-600 italic leading-relaxed">"{candidate.visi}"</p>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Misi</h5>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {candidate.misi.split(',').map((m, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-maroon-600 shrink-0">•</span> {m.trim()}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button 
                        onClick={() => isLoggedIn ? handleVote(candidate.no) : setShowLogin(true)}
                        className={cn(
                          "w-full py-3 rounded-lg font-bold text-white transition shadow-sm",
                          isLoggedIn ? "bg-maroon-800 hover:bg-maroon-900" : "bg-gray-400 cursor-not-allowed opacity-50"
                        )}
                      >
                        {isLoggedIn ? "Pilih Kandidat" : "Login untuk Pilih"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Results and Logs */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Chart */}
              <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BarChart3 size={18} className="text-maroon-800" /> Hasil Sementara
                </h3>
                <div className="flex-1 flex flex-col items-center justify-center relative">
                  <div className="w-56 h-56">
                    <Doughnut data={chartData} options={chartOptions} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col items-center justify-center pointer-events-none pb-4">
                    <span className="text-3xl font-black text-gray-900">{stats?.suaraMasuk || 0}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total Suara</span>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  {candidates.map((c, i) => (
                    <div key={c.no} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartData.datasets[0].backgroundColor[i] }}></div>
                        <span className="font-medium text-gray-600">{i+1}. {c.nama}</span>
                      </div>
                      <span className="font-bold text-gray-900">{c.suara} suara ({(stats?.suaraMasuk ? (c.suara / stats.suaraMasuk * 100).toFixed(1) : 0)}%)</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[10px] text-gray-400 italic text-center font-medium">Update terakhir: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

              {/* Activity Log */}
              <div className="md:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock size={18} className="text-maroon-800" /> Aktivitas Terakhir / Rekap Suara Masuk
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-maroon-900 text-white">
                      <tr>
                        <th className="px-4 py-3 font-semibold rounded-tl-lg">Waktu</th>
                        <th className="px-4 py-3 font-semibold">Nama Pemilih</th>
                        <th className="px-4 py-3 font-semibold">No. TPS</th>
                        <th className="px-4 py-3 font-semibold">Metode</th>
                        <th className="px-4 py-3 font-semibold rounded-tr-lg">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {logs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-4 text-gray-500">{log.waktu}</td>
                          <td className="px-4 py-4 font-bold text-gray-900">{log.nama}</td>
                          <td className="px-4 py-4 text-gray-600">{log.tps}</td>
                          <td className="px-4 py-4 text-gray-600">{log.metode}</td>
                          <td className="px-4 py-4">
                            <span className="flex items-center gap-1 text-green-600 font-bold">
                              <CheckCircle2 size={12} /> {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Login Overlay / Form */}
            {showLogin && !isLoggedIn && (
              <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-maroon-800 border-b pb-4 mb-4">
                  <ShieldCheck size={24} />
                  <h3 className="font-bold text-lg">Login Pemilih</h3>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Masukkan NIK / ID</label>
                    <input 
                      type="text" 
                      value={nikInput}
                      onChange={(e) => setNikInput(e.target.value)}
                      placeholder="Contoh: 12345"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none transition"
                      required
                    />
                  </div>
                  {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
                  <button type="submit" className="w-full bg-maroon-800 text-white font-bold py-3 rounded-lg hover:bg-maroon-900 transition flex items-center justify-center gap-2">
                    Masuk Sekarang <ChevronRight size={16} />
                  </button>
                  <p className="text-[10px] text-gray-400 text-center">Data Anda terlindungi sesuai kebijakan privasi.</p>
                </form>
              </div>
            )}

            {isLoggedIn && (
              <div className="p-6 bg-maroon-900 text-white rounded-xl shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{user.nama}</h3>
                    <p className="text-xs text-red-200 uppercase font-black tracking-widest mt-1">Status: Terverifikasi</p>
                  </div>
                  <button onClick={() => { setIsLoggedIn(false); setUser(null); }} className="p-2 hover:bg-maroon-800 rounded-lg transition">
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Schedule */}
            <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm space-y-6">
              <h3 className="font-bold text-gray-900 border-b pb-4 flex items-center gap-2">
                <Calendar size={18} className="text-maroon-800" /> Jadwal Pemilu
              </h3>
              <div className="space-y-6">
                {[
                  { date: "10-20 Mei 2026", label: "Masa Kampanye", current: false },
                  { date: "25 Mei 2026", label: "Hari Pemungutan Suara", sub: "07:00 - 17:00", current: true },
                  { date: "25 Mei 2026", label: "Penghitungan Suara", sub: "17:00 - 19:00", current: false },
                  { date: "25 Mei 2026", label: "Pengumuman Hasil", sub: "19:30", current: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 relative group">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 z-10",
                        item.current ? "bg-maroon-800 border-maroon-800" : "bg-white border-gray-300"
                      )}></div>
                      {idx !== 3 && <div className="w-0.5 h-full bg-gray-100 absolute top-4"></div>}
                    </div>
                    <div className="pb-2">
                      <h4 className="text-xs font-bold text-gray-900 leading-none mb-1">{item.label}</h4>
                      <p className="text-[10px] text-gray-500 font-medium">{item.date}</p>
                      {item.sub && <p className="text-[10px] text-maroon-600 font-bold mt-1 uppercase tracking-widest">{item.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Info */}
            <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Info size={18} className="text-maroon-800" /> Informasi Pemungutan
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-gray-700">Lokasi</h5>
                    <p className="text-[10px] text-gray-500">Balai RW 04, Jl. Melati No. 10</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-gray-700">Wilayah</h5>
                    <p className="text-[10px] text-gray-500">Kel. Sukamaju, Kec. Sukajadi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Voting Status */}
            <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm text-center space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Status Voting</h3>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="font-bold text-gray-900">Voting Berlangsung</h4>
                <p className="text-[10px] text-gray-500">Silakan gunakan hak suara Anda.</p>
              </div>
              <button className="w-full bg-maroon-800 text-white font-bold py-2 rounded shadow-sm hover:bg-maroon-900 transition mt-2">
                CEK STATUS HAK SUARA
              </button>
            </div>

            {/* Documents */}
            <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-maroon-800" /> Dokumen & Informasi
              </h3>
              <div className="space-y-2">
                {[
                  "Tata Tertib Pemilu RT 2026",
                  "Daftar Pemilih Tetap (DPT)",
                  "Visi Misi Kandidat"
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition group cursor-pointer">
                    <span className="text-[10px] font-medium text-gray-600 group-hover:text-maroon-700">{doc}</span>
                    <LogOut size={12} className="text-gray-300" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-maroon-950 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-maroon-800 rounded-lg flex items-center justify-center shrink-0">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Panitia Pemilihan Ketua RT 2026</h4>
              <p className="text-xs text-red-200 mt-2">RT 04 / RW 04, Kel. Sukamaju, Kota Bandung</p>
              <p className="text-[10px] text-red-300 mt-1">Trimariyonohu@gmail.com • 0812-3456-7890</p>
            </div>
          </div>
          <div className="md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
            <div className="text-center md:text-left space-y-2 max-w-sm">
              <p className="text-sm font-medium italic text-red-100 italic">"Suara Anda Menentukan Masa Depan Lingkungan Kita"</p>
              <p className="text-[11px] text-red-400">Gunakan hak suara Anda dengan bijak dan jujur demi kemajuan bersama.</p>
            </div>
            <div className="flex items-center gap-4 text-red-300 grayscale opacity-80">
              <ShieldCheck size={24} />
              <div className="text-left border-l border-maroon-800 pl-4">
                <p className="text-[10px] font-bold text-white uppercase tracking-wider">Sistem Aman & Terenkripsi</p>
                <p className="text-[9px]">Data dijamin kerahasiaannya.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-maroon-900 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-medium text-red-400 uppercase tracking-widest">
          <p>© 2026 E-VOTING KETUA RT. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white transition">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-white transition">Pusat Bantuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

