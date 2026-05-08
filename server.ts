import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Database simulasi
  let voters = [
    { nama: "Dewi Lestari", nik: "12345", status: "Belum", waktu: "" },
    { nama: "Rudi Hermawan", nik: "23456", status: "Belum", waktu: "" },
    { nama: "Siti Nurjanah", nik: "34567", status: "Belum", waktu: "" },
    { nama: "Agus Setiawan", nik: "45678", status: "Belum", waktu: "" },
    { nama: "Nina Karlina", nik: "56789", status: "Belum", waktu: "" },
  ];

  let candidates = [
    { no: 1, nama: "Budi Santoso", visi: "Mewujudkan lingkungan RT yang aman, bersih, rukun, dan sejahtera melalui gotong royong.", misi: "Meningkatkan keamanan lingkungan, Menggerakkan kegiatan gotong royong, Transparansi dan pelayanan warga.", foto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80", suara: 102 },
    { no: 2, nama: "Ahmad Hidayat", visi: "Menjadi penggerak perubahan positif dengan pelayanan cepat dan transparan.", misi: "Pelayanan cepat dan transparan, Pemberdayaan pemuda dan UMKM, Lingkungan hijau dan sehat.", foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", suara: 94 },
    { no: 3, nama: "Rizky Pratama", visi: "Bersama warga membangun RT yang nyaman, modern, dan berdaya saing.", misi: "Digitalisasi informasi RT, Peningkatan fasilitas umum, Kebersamaan dan kepedulian sosial.", foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80", suara: 82 },
  ];

  let logs: any[] = [
    { waktu: "25 Mei 2026, 10:29", nama: "Dewi Lestari", tps: "TPS 02", metode: "E-Voting", status: "Berhasil" },
    { waktu: "25 Mei 2026, 10:28", nama: "Rudi Hermawan", tps: "TPS 01", metode: "E-Voting", status: "Berhasil" },
    { waktu: "25 Mei 2026, 10:27", nama: "Siti Nurjanah", tps: "TPS 03", metode: "E-Voting", status: "Berhasil" },
    { waktu: "25 Mei 2026, 10:26", nama: "Agus Setiawan", tps: "TPS 02", metode: "E-Voting", status: "Berhasil" },
    { waktu: "25 Mei 2026, 10:25", nama: "Nina Karlina", tps: "TPS 01", metode: "E-Voting", status: "Berhasil" },
  ];

  // API Routes
  app.get("/api/data", (req, res) => {
    const totalVoters = 512; // DPT Tetap
    const suaraMasuk = candidates.reduce((sum, c) => sum + c.suara, 0);
    res.json({
      candidates,
      logs,
      stats: {
        totalVoters,
        totalCandidates: candidates.length,
        suaraMasuk,
        partisipasi: ((suaraMasuk / totalVoters) * 100).toFixed(2) + "%"
      }
    });
  });

  app.post("/api/login", (req, res) => {
    const { nik } = req.body;
    const voter = voters.find(v => v.nik === nik);
    if (!voter) {
      return res.status(404).json({ message: "NIK tidak terdaftar dalam DPT." });
    }
    if (voter.status === "Sudah") {
      return res.status(403).json({ message: "Anda sudah menggunakan hak suara Anda." });
    }
    res.json({ voter });
  });

  app.post("/api/vote", (req, res) => {
    const { nik, candidateNo } = req.body;
    const voterIndex = voters.findIndex(v => v.nik === nik);
    if (voterIndex === -1 || voters[voterIndex].status === "Sudah") {
      return res.status(400).json({ message: "Gagal memproses suara." });
    }

    const candidate = candidates.find(c => c.no === candidateNo);
    if (candidate) {
      candidate.suara += 1;
      voters[voterIndex].status = "Sudah";
      voters[voterIndex].waktu = new Date().toLocaleString();
      
      logs.unshift({
        waktu: new Date().toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        nama: voters[voterIndex].nama,
        tps: "TPS 01", // Demo
        metode: "E-Voting",
        status: "Berhasil"
      });
      if (logs.length > 5) logs.pop();

      res.json({ success: true });
    } else {
      res.status(404).json({ message: "Kandidat tidak ditemukan." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
