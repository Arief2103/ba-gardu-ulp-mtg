/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PLN Form Pengujian Jaringan & GTT - Dedicated Cloud Database Edition
 * Mempertahankan presisi A4PrintForm orisinal, meniadakan sidebar,
 * mengandalkan bar navigasi atas & sinkronisasi multi-uji Firebase Firestore / Supabase cloud.
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Zap, 
  Printer, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Cloud, 
  CloudOff, 
  Database, 
  Trash2, 
  Plus, 
  ChevronDown, 
  HelpCircle, 
  FileText, 
  UploadCloud, 
  Info, 
  X,
  Sparkle
} from "lucide-react";
import type { PerformanceTestData } from "./types.ts";
import { defaultPerformanceTestData } from "./types.ts";
import A4PrintForm from "./components/A4PrintForm.tsx";
import { supabase, isSupabaseConfigured } from "./supabase";
import logoPln from "./assets/images/logo-pln.png";

interface CloudReport {
  id: string;
  name: string;
  updatedAt: string;
  data: PerformanceTestData;
}

interface LocalDraft {
  id: string;
  name: string;
  updatedAt: string;
  data: PerformanceTestData;
}

export default function App() {
  // Form State
  const [formData, setFormData] = useState<PerformanceTestData>(defaultPerformanceTestData());
  
  // Naming & Document Tracking State
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Databases Lists
  const [onlineReports, setOnlineReports] = useState<CloudReport[]>([]);
  const [localDrafts, setLocalDrafts] = useState<LocalDraft[]>([]);
  
  // UI States
  const [showSupabaseGuide, setShowSupabaseGuide] = useState(false);
  const [showLoadDocDropdown, setShowLoadDocDropdown] = useState(false);
  const [uiMessage, setUiMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Auto-hide alert messages after 5 seconds
  useEffect(() => {
    if (uiMessage) {
      const timer = setTimeout(() => {
        setUiMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uiMessage]);

  // Sync document.title with the Nama Laporan input field for PDF title filename on print
  useEffect(() => {
    if (documentName.trim()) {
      document.title = documentName;
    } else {
      document.title = "BERITA ACARA HASIL PENGOPERASIAN GTT - JARINGAN";
    }
  }, [documentName]);

  // Load local drafts from localStorage for fallback
  useEffect(() => {
    try {
      const raw = localStorage.getItem("pln_performance_drafts");
      if (raw) {
        setLocalDrafts(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Gagal membaca localDrafts dari localStorage:", e);
    }
  }, []);

  // Real-time listener/fetch for Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      console.log("Supabase belum dikonfigurasi. Mengandalkan penyimpanan fallback berkualitas tinggi.");
      return;
    }

    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from("pln_reports")
          .select("*")
          .order("updatedAt", { ascending: false });
        
        if (error) throw error;

        if (data) {
          const list: CloudReport[] = data.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            updatedAt: item.updatedAt,
            data: item.data as PerformanceTestData
          }));
          setOnlineReports(list);
        }
      } catch (err) {
        console.error("Gagal mengambil data dari Supabase:", err);
      }
    };

    fetchReports();

    try {
      const channel = supabase
        .channel("public:pln_reports")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "pln_reports" },
          () => {
            fetchReports();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.error("Gagal berlangganan real-time Supabase:", e);
    }
  }, []);

  // Helper: Format date for document labels
  const getFormattedDate = () => {
    return new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Action: Autofill preset GTT-04 (Demo Data)
  const handleAutoFill = () => {
    const demoData: PerformanceTestData = {
      nomorForm: "FS. 10-03/MADIUN/042",
      hari: "Rabu",
      tanggal: "20",
      bulan: "Mei",
      tahun: "2026",
      garduInduk: "GI MADIUN",
      penyulang: "CARUBAN EXPRESS",
      sectionLine: "11",
      branchLine: "4",
      nomorGardu: "DP.04",
      alamat: "Jl. Raya Solo-Madiun No.14, Dolopo",
      alamatLanjutan: "",

      sutrMerk: "Kabelindo",
      sutrPenampang: "3x70 + 1x50",
      sutrPanjang: "2.5",
      sutmMerk: "Sumindo",
      sutmPenampang: "3x150",
      sutmPanjang: "4.8",
      sktmMerk: "Prysmian",
      sktmPenampang: "3x240",
      sktmPanjang: "0.4",

      merkTrafo: "UNINDO",
      noSeriTrafo: "TR.7289-2021",
      dayaTrafo: "200",
      frekuensiTrafo: "50",
      jumlahFase: "3",
      kelompokVektor: "Dyn5",
      teganganPrimer: "20",
      teganganSekunder: "380/220",
      arusPrimer: "5.77",
      arusSekunder: "288.6",
      impendans: "4",
      tapTrafo: "3",
      tapTrafoMax: "5",
      teganganTap: "20.000",

      caraPendinginan: "ONAN",
      jenisMinyak: "MINERAL",
      beratMinyak: "185",
      beratTotal: "980",
      tingkatIsolasi: "LI 125 AC 50",
      tahunPembuatan: "2021",
      pabrikPembuat: "PT Unindo France",
      konstruksiTrafo: "CSP (Completely Self Protected)",
      transformatorStatus: "Mutasi",
      bengkelRekon: "JP",
      trafoStatus: "Umum",

      meggerPrimerRG: "5000",
      meggerPrimerSG: "5400",
      meggerPrimerTG: "5200",
      meggerPrimerRS: "8200",
      meggerPrimerRT: "8500",
      meggerPrimerST: "8300",

      meggerSekunderRG: "800",
      meggerSekunderSG: "790",
      meggerSekunderTG: "810",
      meggerSekunderRS: "1200",
      meggerSekunderRT: "1250",
      meggerSekunderST: "1190",

      meggerPrimSekRR: "4500",
      meggerPrimSekRS: "4400",
      meggerPrimSekRT: "4600",
      meggerPrimSekRN: "4300",
      meggerPrimSekSR: "4550",
      meggerPrimSekSS: "4420",
      meggerPrimSekST: "4510",
      meggerPrimSekSN: "4350",
      meggerPrimSekTR: "4610",
      meggerPrimSekTS: "4470",
      meggerPrimSekTT: "4590",
      meggerPrimSekTN: "4300",

      meggerSutrRG: "1500",
      meggerSutrSG: "1550",
      meggerSutrTG: "1480",
      meggerSutrRS: "2100",
      meggerSutrRT: "2050",
      meggerSutrST: "2080",

      meggerSutrKananRG: "1620",
      meggerSutrKananSG: "1590",
      meggerSutrKananTG: "1650",
      meggerSutrKananRS: "2180",
      meggerSutrKananRT: "2110",
      meggerSutrKananST: "2205",

      meggerSutmRG: "9800",
      meggerSutmSG: "9700",
      meggerSutmTG: "9900",
      meggerSutmRS: "14500",
      meggerSutmRT: "14800",
      meggerSutmST: "14600",

      gttNetral: "0.85",
      gttArester: "1.2",
      gttBody: "1.5",

      jtrUjungNetral: "3.4",

      fudengTrafoX: "10",
      fudengTrafoY: "16",
      fudengRG: "1200",
      fudengSG: "1150",
      fudengTG: "1250",
      fudengRS: "1800",
      fudengRT: "1850",
      fudengST: "1790",

      voltRN: "228",
      voltSN: "227",
      voltTN: "229",
      voltRS: "395",
      voltRT: "396",
      voltST: "394",

      merkPembatasTrafo: "Schneider",
      amperePembatasTrafo: "3 x 100",
      merkSaklarUtama: "ABB OETL",
      arusNominasiSaklarUtama: "400",
      merkPembatasUtama: "Schneider MCCB",
      amperePembatasUtama: "350",
      merkPembatasLyne: "NH Fuse",
      amperePembatasLyne: "160",
      merkPembatasLyne2: "NH Fuse",
      amperePembatasLyne2: "160",

      arahUrutanFasa: "KANAN",
      keteranganOperasi: "SUDAH",
      jamOperasi: "11:45",
      tanggalOperasi: "20 Mei 2026",

      namaPetugasMadiun: "Budi Santoso",
      namaPimpinanUlp: "Arief Hidayat (Manager)",
      namaPelaksana: "Andik Prasetya (CV Citra)",
      signaturePetugasMadiun: "",
      signaturePimpinanUlp: "",
      signaturePelaksana: "",
      sutrMemo: "FUDENG SUTR L1",
      sutrKananMemo: "FUDENG SUTR L2"
    };

    setFormData(demoData);
    setDocumentName("Gardu Draf DP.04 Madiun");
    setUiMessage({ type: "success", text: "Berhasil memuat contoh data pengujian draf PLN Area Madiun!" });
  };

  // Action: Reset/Empty Form
  const handleReset = () => {
    if (window.confirm("Apakah Anda yakin ingin mengosongkan seluruh formulir pengujian?")) {
      setFormData(defaultPerformanceTestData());
      setDocumentName("");
      setCurrentDocId(null);
      setUiMessage({ type: "info", text: "Seluruh bidang formulir telah dikosongkan." });
    }
  };

  // Action: Print PDF Document
  const handlePrint = () => {
    window.print();
  };

  // Action: Inline Editing values in sheet
  const handleInputChange = (field: keyof PerformanceTestData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // PERSISTENCE ENGINE: SAVE HANDLER (AUTO ROUTING TO CLOUD OR LOCAL FALLBACK)
  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const activeName = documentName.trim() || `Laporan Gardu ${formData.nomorGardu || "Sesaat"}`;
    const timestampStr = getFormattedDate();

    if (isSupabaseConfigured && supabase) {
      // CLOUD DATABASE ROUTE (SUPABASE)
      try {
        const payload = {
          name: activeName,
          updatedAt: new Date().toISOString(),
          data: formData
        };

        if (currentDocId) {
          // Update Existing Supabase Document
          const { error } = await supabase
            .from("pln_reports")
            .update(payload)
            .eq("id", currentDocId);

          if (error) throw error;
          setUiMessage({ type: "success", text: `Cloud Supabase: Sukses memperbarui data "${activeName}"` });
        } else {
          // Create New Supabase Document
          const { data, error } = await supabase
            .from("pln_reports")
            .insert(payload)
            .select();

          if (error) throw error;
          if (data && data[0]) {
            setCurrentDocId(String(data[0].id));
          }
          setUiMessage({ type: "success", text: `Cloud Supabase: Sukses menyimpan baru "${activeName}"` });
        }

        // Refresh list
        const { data: listData } = await supabase
          .from("pln_reports")
          .select("*")
          .order("updatedAt", { ascending: false });
        if (listData) {
          setOnlineReports(listData.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            updatedAt: item.updatedAt,
            data: item.data as PerformanceTestData
          })));
        }
      } catch (err: any) {
        console.error("Gagal sinkron Supabase:", err);
        setUiMessage({ type: "error", text: "Gagal menyimpan online: " + err.message });
      } finally {
        setIsSaving(false);
      }
    } else {
      // LOCAL FALLBACK ROUTE
      try {
        if (currentDocId) {
          // Update existing
          const updatedDrafts = localDrafts.map(d => {
            if (d.id === currentDocId) {
              return { ...d, name: activeName, updatedAt: timestampStr, data: formData };
            }
            return d;
          });
          setLocalDrafts(updatedDrafts);
          localStorage.setItem("pln_performance_drafts", JSON.stringify(updatedDrafts));
          setUiMessage({ type: "success", text: `Lokal (Fallback): Berhasil memperbarui draf "${activeName}"` });
        } else {
          // Save new
          const randomId = Date.now().toString();
          const newDraft: LocalDraft = {
            id: randomId,
            name: activeName,
            updatedAt: timestampStr,
            data: formData
          };
          const updatedDrafts = [newDraft, ...localDrafts];
          setLocalDrafts(updatedDrafts);
          localStorage.setItem("pln_performance_drafts", JSON.stringify(updatedDrafts));
          setCurrentDocId(randomId);
          setUiMessage({ type: "success", text: `Lokal (Fallback): Berhasil membuat draf baru "${activeName}"` });
        }
      } catch (err) {
        console.error("Gagal draf di localStorage:", err);
        setUiMessage({ type: "error", text: "Terjadi gangguan saat menyimpan ke draf lokal." });
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Action: Save as a NEW document option
  const handleSaveAsNewAndClone = async () => {
    if (!documentName.trim()) {
      setUiMessage({ type: "error", text: "Harap masukkan nama dokumen terlebih dahulu untuk menyalin." });
      return;
    }

    setIsSaving(true);
    const activeName = `${documentName.trim()} (Salinan)`;
    const timestampStr = getFormattedDate();

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          name: activeName,
          updatedAt: new Date().toISOString(),
          data: formData
        };
        const { data, error } = await supabase
          .from("pln_reports")
          .insert(payload)
          .select();

        if (error) throw error;
        if (data && data[0]) {
          setCurrentDocId(String(data[0].id));
        }
        setDocumentName(activeName);
        setUiMessage({ type: "success", text: `Cloud Supabase: Sukses menduplikasi draf baru "${activeName}"` });

        // Refresh list
        const { data: listData } = await supabase
          .from("pln_reports")
          .select("*")
          .order("updatedAt", { ascending: false });
        if (listData) {
          setOnlineReports(listData.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            updatedAt: item.updatedAt,
            data: item.data as PerformanceTestData
          })));
        }
      } catch (err: any) {
        setUiMessage({ type: "error", text: "Gagal menduplikasi online: " + err.message });
      } finally {
        setIsSaving(false);
      }
    } else {
      try {
        const randomId = Date.now().toString();
        const newDraft: LocalDraft = {
          id: randomId,
          name: activeName,
          updatedAt: timestampStr,
          data: formData
        };
        const updatedDrafts = [newDraft, ...localDrafts];
        setLocalDrafts(updatedDrafts);
        localStorage.setItem("pln_performance_drafts", JSON.stringify(updatedDrafts));
        setCurrentDocId(randomId);
        setDocumentName(activeName);
        setUiMessage({ type: "success", text: `Lokal (Fallback): Draf telah diduplikasi sebagai "${activeName}"` });
      } catch (err) {
        setUiMessage({ type: "error", text: "Terjadi gangguan saat menduplikasi." });
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Action: Load chosen document parameters
  const handleLoadDocument = (id: string, name: string, data: PerformanceTestData) => {
    setFormData(data);
    setDocumentName(name);
    setCurrentDocId(id);
    setShowLoadDocDropdown(false);
    setUiMessage({ type: "info", text: `Dokumen "${name}" berhasil dimuat.` });
  };

  // Action: Delete document from database
  const handleDeleteDocument = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Yakin ingin menghapus dokumen "${name}" secara permanen? Tindakan ini tidak bisa dibatalkan.`)) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("pln_reports")
          .delete()
          .eq("id", id);

        if (error) throw error;

        if (currentDocId === id) {
          setCurrentDocId(null);
          setDocumentName("");
          setFormData(defaultPerformanceTestData());
        }
        setUiMessage({ type: "success", text: `Cloud Supabase: Sukses menghapus "${name}"` });

        // Refresh list
        const { data: listData } = await supabase
          .from("pln_reports")
          .select("*")
          .order("updatedAt", { ascending: false });
        if (listData) {
          setOnlineReports(listData.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            updatedAt: item.updatedAt,
            data: item.data as PerformanceTestData
          })));
        } else {
          setOnlineReports([]);
        }
      } catch (err: any) {
        setUiMessage({ type: "error", text: "Gagal menghapus online: " + err.message });
      }
    } else {
      try {
        const filtered = localDrafts.filter(d => d.id !== id);
        setLocalDrafts(filtered);
        localStorage.setItem("pln_performance_drafts", JSON.stringify(filtered));
        if (currentDocId === id) {
          setCurrentDocId(null);
          setDocumentName("");
          setFormData(defaultPerformanceTestData());
        }
        setUiMessage({ type: "success", text: `Lokal: Sukses menghapus draf "${name}"` });
      } catch (err) {
        setUiMessage({ type: "error", text: "Terjadi gangguan saat menghapus draf lokal." });
      }
    }
  };

  const activeDocLabel = currentDocId 
    ? onlineReports.find(d => d.id === currentDocId)?.name || localDrafts.find(d => d.id === currentDocId)?.name || "Draf Aktif"
    : "Lembaran Baru";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900 leading-normal">
      
      {/* GLOBAL BANNER NOTIK / TOAST */}
      {uiMessage && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3.5 rounded-xl shadow-2xl flex items-center justify-between gap-3 border border-slate-750 max-w-sm animate-slideUp">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${uiMessage.type === "success" ? "bg-emerald-500" : uiMessage.type === "error" ? "bg-rose-500" : "bg-amber-500"}`} />
            <p className="font-semibold leading-relaxed">{uiMessage.text}</p>
          </div>
          <button onClick={() => setUiMessage(null)} className="p-0.5 hover:bg-slate-800 rounded text-slate-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER BAR (No-Print) */}
      <header id="header-nav" className="no-print bg-slate-900 text-white sticky top-0 z-45 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg flex items-center justify-center shadow-md border border-slate-700">
              <img 
                src={logoPln} 
                alt="Logo PLN" 
                className="h-9 w-9 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 leading-tight">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white uppercase">
                  BERITA ACARA HASIL PENGOPERASIAN GTT - JARINGAN
                </h1>
                <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  MANTINGAN
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                PT PLN (Persero) Area Madiun - ULP Mantingan
              </p>
            </div>
          </div>

        </div>
      </header>

      {/* SUPABASE MANUAL CONFIGURATION GUIDE STEP-BY-STEP (Toggled by user, No-Print) */}
      {showSupabaseGuide && (
        <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex gap-2">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Panduan Konfigurasi Manual Database Supabase
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ikuti langkah di bawah untuk mendaftarkan dan menggunakan database cloud Supabase orisinal milik Anda sendiri secara gratis.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowSupabaseGuide(false)} 
                className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs mt-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-slate-900 font-bold text-[11px] uppercase tracking-wider">
                  <span className="bg-amber-100 text-amber-900 text-xs w-5 h-5 rounded-full flex items-center justify-center mr-0.5 font-black">1</span>
                  Supabase Project
                </div>
                <p className="text-slate-600 leading-relaxed text-[10.5px]">
                  Buka website <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">Supabase Console</a>, daftar gratis, lalu klik <strong>&quot;New Project&quot;</strong>.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-slate-900 font-bold text-[11px] uppercase tracking-wider">
                  <span className="bg-amber-100 text-amber-900 text-xs w-5 h-5 rounded-full flex items-center justify-center mr-0.5 font-black">2</span>
                  Buat Tabel pln_reports
                </div>
                <p className="text-slate-600 leading-relaxed text-[10.5px]">
                  Masuk ke menu <strong>SQL Editor</strong> di sidebar kiri, lalu tempel instruksi SQL berikut dan klik <strong>&quot;Run&quot;</strong>:
                </p>
                <pre className="p-1.5 bg-slate-100 text-[9px] text-slate-705 rounded font-mono select-all overflow-x-auto">
{`create table pln_reports (
  id bigint primary key generated always as identity,
  name text not null,
  "updatedAt" text not null,
  data jsonb not null
);`}
                </pre>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-slate-900 font-bold text-[11px] uppercase tracking-wider">
                  <span className="bg-amber-100 text-amber-900 text-xs w-5 h-5 rounded-full flex items-center justify-center mr-0.5 font-black">3</span>
                  Aktifkan Akses RLS
                </div>
                <p className="text-slate-600 leading-relaxed text-[10.5px]">
                  Aktifkan RLS (Row Level Security) agar browser Anda diizinkan untuk menyimpan berkas. Di SQL Editor, jalankan perintah lanjutan:
                </p>
                <pre className="p-1.5 bg-slate-100 text-[9px] text-slate-705 rounded font-mono select-all overflow-x-auto">
{`alter table pln_reports enable row level security;
create policy "Allow all to anon" on pln_reports
  for all using (true) with check (true);`}
                </pre>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-slate-900 font-bold text-[11px] uppercase tracking-wider">
                  <span className="bg-amber-100 text-amber-900 text-xs w-5 h-5 rounded-full flex items-center justify-center mr-0.5 font-black">4</span>
                  Konfigurasi File .env
                </div>
                <p className="text-slate-600 leading-relaxed text-[10.5px]">
                  Buka menu <strong>Project Settings &gt; API</strong> untuk mendapatkan URL dan Anon API Key. Isi draf berkas ini di <code>.env</code> Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONSOLIDATED ACTION COMMAND BAR (No-Print) */}
      <section className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col gap-4">
          
          {/* Row 1: Document Name Input */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left Name Input Form */}
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg border border-slate-200/60">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] text-slate-600 font-bold whitespace-nowrap">Nama Laporan :</span>
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Isi judul / nama draf (Nama ini akan digunakan sebagai nama file PDF)"
                  className="w-full text-xs p-2.5 font-bold bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none placeholder-slate-400 text-black"
                />
              </div>
            </div>

          </div>

          {/* Row 2: Secondary Operation buttons (Preset fillers, print, reset) */}
          <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs font-semibold">
            
            <div />

            {/* Right aligned: Print PDF - Blank document Reset */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-250 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Kosongkan Formulir</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <Printer className="w-4 h-4 text-emerald-100 animate-bounce" />
                <span>Cetak A4 / Unduh PDF 📄</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* THE MAIN INTERACTIVE WORKSPACE AREA (Centered Sheet layout) */}
      <main className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 py-4 mb-12">
        {/* On desktop: Slate page board; on mobile: simple clean layout without extra margins */}
        <div id="pdf-interactive-container" className="bg-slate-200/60 md:p-8 p-1 sm:p-2 rounded-2xl flex justify-center shadow-inner border border-slate-300 overflow-visible min-h-[900px]">
          <A4PrintForm
            formData={formData}
            onChange={handleInputChange}
            printRef={useRef<HTMLDivElement>(null)}
          />
        </div>
      </main>

      {/* FOOTER BAR (No-Print) */}
      <footer className="no-print bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-4 text-[11px] space-y-1">
          <p>© 2026 PT PLN (Persero) ULP Mantingan</p>
          <p className="text-slate-550 text-[10px]">Berita Acara Tentang Hasil Pengoperasian GTT - Jaringan</p>
        </div>
      </footer>

    </div>
  );
}
