/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PLN Form Pengujian Jaringan & GTT - Dedicated Cloud Database Edition
 * Mempertahankan presisi A4PrintForm orisinal, meniadakan sidebar,
 * mengandalkan bar navigasi atas & sinkronisasi multi-uji Firebase Firestore / Supabase cloud.
 */

import { useState, useRef, useEffect } from "react";
import { 
  Printer, 
  RotateCcw, 
  Database, 
  X
} from "lucide-react";
import type { PerformanceTestData } from "./types.ts";
import { defaultPerformanceTestData } from "./types.ts";
import A4PrintForm from "./components/A4PrintForm.tsx";
import logoPln from "./assets/images/logo-pln.png";

export default function App() {
  // Form State
  const [formData, setFormData] = useState<PerformanceTestData>(defaultPerformanceTestData());
  
  // Naming & Document Tracking State
  const [documentName, setDocumentName] = useState<string>("");
  
  // UI States
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





  // Action: Reset/Empty Form
  const handleReset = () => {
    if (window.confirm("Apakah Anda yakin ingin mengosongkan seluruh formulir pengujian?")) {
      setFormData(defaultPerformanceTestData());
      setDocumentName("");
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
                  placeholder="Isi judul / nama draf (misal: Gardu DP.04 Dolopo)... Nama ini akan digunakan sebagai nama file PDF."
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
          <p>© 2026 PT PLN (Persero) Area Madiun - Distribusi Jawa Timur</p>
          <p className="text-slate-550 text-[10px]">Pemasukan Tegangan JTR &amp; Hasil Pengoperasian GTT Modern Interface</p>
        </div>
      </footer>

    </div>
  );
}
