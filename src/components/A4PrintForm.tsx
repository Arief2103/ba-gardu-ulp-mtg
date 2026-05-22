import React, { useState, useEffect, useRef } from "react";
import type { PerformanceTestData } from "../types.ts";
import { X } from "lucide-react";
import InlineField from "./InlineField.tsx";
import { SignaturePadModal } from "./SignaturePadModal.tsx";
import logoPerfomtest from "../assets/images/logo-perfomtest.png";

interface PrintDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  allowCustom?: boolean;
  placeholder?: string;
  className?: string;
}

function PrintDropdown({
  value,
  onChange,
  options,
  allowCustom = false,
  placeholder = "......",
  className = ""
}: PrintDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomEditing, setIsCustomEditing] = useState(false);
  const [customVal, setCustomVal] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCustomEditing(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
    setIsCustomEditing(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customVal.trim()) {
      onChange(customVal.trim());
    }
    setIsOpen(false);
    setIsCustomEditing(false);
  };

  return (
    <div ref={dropdownRef} className="relative inline-flex items-center text-black font-semibold no-break-word">
      {/* Printable text selection (Always formal black, no gray/blue) */}
      <span className={`font-mono text-black font-extrabold select-none ${className}`}>
        {value || placeholder}
      </span>

      {/* Small box trigger button next to it (Hidden on print) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="no-print ml-1 px-1 py-0.5 bg-white border border-black hover:bg-slate-100 rounded text-[7.5px] font-bold text-black flex items-center justify-center gap-0.5 cursor-pointer leading-none min-h-[14px] shadow-xs"
        title="Klik untuk memilih"
      >
        <span>[pilih]</span>
        <span className="text-[6px]">▼</span>
      </button>

      {/* Popover Dropdown menu */}
      {isOpen && (
        <div className="no-print absolute left-0 top-[100%] mt-1 bg-white border-2 border-black rounded shadow-xl py-1 z-50 min-w-[125px] max-h-[180px] overflow-y-auto text-black font-semibold">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelect(opt)}
              className={`w-full text-left px-2 py-1 text-[8.5px] hover:bg-black hover:text-white flex items-center justify-between font-mono ${
                value === opt ? "bg-slate-100 font-extrabold" : ""
              }`}
            >
              <span>{opt}</span>
              {value === opt && <span className="text-[7.5px]">✓</span>}
            </button>
          ))}

          {allowCustom && (
            <div className="border-t border-black mt-1 pt-1 px-1.5 bg-slate-50">
              {!isCustomEditing ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomEditing(true);
                    setCustomVal(options.includes(value) ? "" : value);
                  }}
                  className="w-full text-left px-1 py-0.5 text-[8px] text-black hover:underline font-mono italic flex items-center justify-between"
                >
                  <span>Kustom...</span>
                </button>
              ) : (
                <form onSubmit={handleCustomSubmit} className="flex gap-1 items-center pb-0.5">
                  <input
                    type="text"
                    value={customVal}
                    onChange={(e) => setCustomVal(e.target.value)}
                    placeholder="Isi..."
                    className="flex-grow px-1 py-0.5 border border-black text-[8px] rounded font-mono min-w-[50px] bg-white text-black outline-none focus:ring-1 focus:ring-black"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-1 py-0.5 bg-black text-white hover:bg-slate-800 rounded text-[7.5px] font-bold"
                  >
                    Ok
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface A4PrintFormProps {
  formData: PerformanceTestData;
  onChange: (field: keyof PerformanceTestData, value: string) => void;
  printRef: React.RefObject<HTMLDivElement | null>;
}

export default function A4PrintForm({ formData, onChange, printRef }: A4PrintFormProps) {
  const [scale, setScale] = useState(1);
  const [signatureModal, setSignatureModal] = useState<{
    isOpen: boolean;
    field: "signaturePetugasMadiun" | "signaturePimpinanUlp" | "signaturePelaksana";
    title: string;
  } | null>(null);
  const containerResizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerResizerRef.current) {
        // Measure real container width on screen
        const parentWidth = containerResizerRef.current.parentElement
          ? containerResizerRef.current.parentElement.clientWidth
          : containerResizerRef.current.clientWidth;
        
        // Target structural width for perfectly rendered form is 820px
        const targetWidth = 820;
        
        if (parentWidth < targetWidth && parentWidth > 0) {
          const paddingBuffer = 12; // safety margin for screen edges
          let calculatedScale = (parentWidth - paddingBuffer) / targetWidth;
          // Set a safe minimum scale of 0.75 so text and inputs do not collide on phone layouts
          if (calculatedScale < 0.75) {
            calculatedScale = 0.75;
          }
          setScale(calculatedScale);
        } else {
          setScale(1);
        }
      }
    };

    handleResize();

    // Responsive listening for window resize and orientation change
    const resizeObserver = new ResizeObserver(() => handleResize());
    if (containerResizerRef.current && containerResizerRef.current.parentElement) {
      resizeObserver.observe(containerResizerRef.current.parentElement);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleFieldChange = (field: keyof PerformanceTestData, value: string) => {
    onChange(field, value);
  };

  const handleAutoFillFromDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const d = new Date(val);
    if (isNaN(d.getTime())) return;
    
    const IndonesianDays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const IndonesianMonths = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    const h = IndonesianDays[d.getDay()];
    const t = String(d.getDate());
    const b = IndonesianMonths[d.getMonth()];
    const y = String(d.getFullYear());
    
    handleFieldChange("hari", h);
    handleFieldChange("tanggal", t);
    handleFieldChange("bulan", b);
    handleFieldChange("tahun", y);
    
    // Also auto-update signature/print date as a bonus!
    handleFieldChange("tanggalOperasi", `${t} ${b} ${y}`);
  };

  const MaggerRow = ({ 
    label, 
    field,
    placeholder = "......", 
    labelWidthClass = "w-8" 
  }: { 
    label: string; 
    field: keyof PerformanceTestData; 
    placeholder?: string; 
    labelWidthClass?: string;
  }) => {
    const val = String(formData[field] || "");
    return (
      <div className="flex items-center min-h-[12px] text-[8px] leading-none mb-[0.5px] text-black" id={`magger-row-${field}`}>
        <span className={`${labelWidthClass} flex-shrink-0 font-bold whitespace-nowrap text-left text-black`}>{label}</span>
        <span className="w-2 flex-shrink-0 text-center font-bold font-mono text-black">:</span>
        <div className={`flex-grow mx-0.5 min-w-[20px] flex items-center justify-center ${val ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
          <InlineField 
            value={val} 
            onChange={(v) => handleFieldChange(field, v)} 
            placeholder={placeholder} 
            className="font-mono text-center w-full font-bold ml-1 text-black text-[8px]" 
          />
        </div>
        <span className="w-5 flex-shrink-0 text-right text-[7.5px] font-bold text-black font-mono">Ohm</span>
      </div>
    );
  };

  const VoltRow = ({ 
    label, 
    field 
  }: { 
    label: string; 
    field: keyof PerformanceTestData; 
  }) => {
    const val = String(formData[field] || "");
    return (
      <div className="flex items-center min-h-[12px] text-[8px] leading-none mb-[0.5px] text-black" id={`volt-row-${field}`}>
        <span className="w-8 flex-shrink-0 font-bold whitespace-nowrap text-left text-black">{label}</span>
        <span className="w-2 flex-shrink-0 text-center font-bold font-mono text-black">:</span>
        <div className={`flex-grow mx-0.5 min-w-[20px] flex items-center justify-center ${val ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
          <InlineField 
            value={val} 
            onChange={(v) => handleFieldChange(field, v)} 
            placeholder="......" 
            className="font-mono text-center w-full font-bold ml-1 text-[8px] text-black" 
          />
        </div>
        <span className="w-5 flex-shrink-0 text-right font-bold text-[7.5px] text-black font-mono">Volt</span>
      </div>
    );
  };

  return (
    <div 
      ref={containerResizerRef}
      className="w-full flex justify-start lg:justify-center items-start overflow-x-auto pb-4 scrollbar-thin print:overflow-visible print:pb-0"
      style={{
        // Match proportional height dynamically to eliminate white space gaps on phone screens
        height: scale !== 1 ? `calc(1190px * ${scale})` : "auto",
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <div 
        className="flex-shrink-0 print:w-full print:h-auto print:block print:overflow-visible"
        style={{
          width: scale !== 1 ? `calc(820px * ${scale})` : "820px",
          height: scale !== 1 ? `calc(1160px * ${scale})` : "1160px",
        }}
      >
        <div 
          ref={printRef}
          className="print-container bg-white text-black shadow-lg relative font-sans leading-tight border border-slate-300 origin-top-left overflow-hidden print:shadow-none print:border-none print:p-[0.5cm] print:transform-none"
          style={{
            width: "820px",
            minHeight: "1160px",
            transform: scale !== 1 ? `scale(${scale})` : "none",
            padding: "0.5cm",
          }}
          id="a4-print-sheet"
        >
        {/* 1. DOCUMENT HEADER (KOP LAPORAN - TEMPEL LANGSUNG) */}
        <div className="w-full mb-0 border-[1.5px] border-black bg-white overflow-hidden">
          <img 
            src={logoPerfomtest} 
            alt="Kop Hasil Pengujian Jaringan Distribusi PLN Area Madiun" 
            className="w-full h-auto object-contain block"
            referrerPolicy="no-referrer"
          />
        </div>
   
        {/* FORM REGISTRATION NUMBER BAR */}
        <div className="grid grid-cols-4 gap-1 py-0.5 px-0.5">
          <div className="col-span-2"></div>
          <div className="col-span-2 flex justify-center text-[8.5px] font-bold items-center gap-[2px] text-black">
            <span className="text-black">Nomor :</span>
            <InlineField
              value={formData.nomorForm}
              onChange={(val) => handleFieldChange("nomorForm", val)}
              placeholder="..................."
              className="font-mono border-b border-black font-normal min-w-[135px] text-left text-black text-[8.5px] pl-1"
            />
          </div>
        </div>
   
        {/* SUBHEADER SCHEDULE */}
        <div className="text-[9.5px] leading-relaxed mb-2 font-medium space-y-1 text-black">
          <div className="grid grid-cols-4 gap-1 items-center">
            <div className="flex items-center gap-[3px]">
              <span className="whitespace-nowrap">Pada hari ini :</span>
              <InlineField 
                type="select-or-text"
                options={["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]}
                value={formData.hari} 
                onChange={(val) => handleFieldChange("hari", val)} 
                placeholder=".........." 
                className="font-bold font-mono text-black text-[9.5px]" 
              />
            </div>
            <div className="flex items-center gap-[3px]">
              <span className="whitespace-nowrap">Tanggal :</span>
              <InlineField 
                type="select-or-text"
                options={Array.from({ length: 31 }, (_, i) => String(i + 1))}
                value={formData.tanggal} 
                onChange={(val) => handleFieldChange("tanggal", val)} 
                placeholder=".........." 
                className="font-bold font-mono text-black text-[9.5px]" 
              />
              <label className="no-print inline-flex items-center ml-1 cursor-pointer hover:text-sky-600 transition-all select-none" title="Pilih Hari/Tanggal lewat Kalender">
                <input 
                  type="date" 
                  onChange={handleAutoFillFromDate} 
                  className="sr-only" 
                />
                <span className="p-[2.5px] bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-sky-600 rounded font-bold border border-slate-300 text-[8.5px] flex items-center justify-center gap-0.5">
                  📅
                </span>
              </label>
            </div>
            <div className="flex items-center gap-[3px]">
              <span className="whitespace-nowrap">Bulan :</span>
              <InlineField 
                type="select-or-text"
                options={["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]}
                value={formData.bulan} 
                onChange={(val) => handleFieldChange("bulan", val)} 
                placeholder=".........." 
                className="font-bold font-mono text-black text-[9.5px]" 
              />
            </div>
            <div className="flex items-center gap-[3px]">
              <span className="whitespace-nowrap">Tahun :</span>
              <InlineField 
                value={formData.tahun} 
                onChange={(val) => handleFieldChange("tahun", val)} 
                placeholder=".........." 
                className="font-bold font-mono text-black text-[9.5px]" 
              />
            </div>
          </div>
          <div>
            Berdasarkan Jadwal Pengoperasian dari <span className="font-bold">PT. PLN (Persero) Area Madiun</span>
          </div>
          <div className="pl-6 font-semibold">
            Kami yang bertanda tangan di bawah ini, telah mengadakan pemasukan tegangan / pengoperasian dilokasi :
          </div>
        </div>
   
        {/* GRID SEC-1: GARDU SPECS & JARINGAN SPECS (2 COLUMN SPLIT) */}
        <div className="grid grid-cols-12 gap-2 mb-1.5 items-stretch text-black">
          {/* Left Specs List */}
          <div className="col-span-7 flex flex-col justify-between h-full py-0 space-y-1">
            <div className="flex items-center min-h-[15px]">
              <span className="w-[125px] flex-shrink-0 font-semibold text-black text-[9px]">GARDU INDUK</span>
              <span className="w-[10px] flex-shrink-0 font-bold text-black text-[9px]">:</span>
              <span className={`flex-grow flex items-center ${formData.garduInduk ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                <InlineField value={formData.garduInduk} onChange={(val) => handleFieldChange("garduInduk", val)} placeholder=".........." className="font-mono text-black font-extrabold text-[9px] w-full" />
              </span>
            </div>
            <div className="flex items-center min-h-[15px]">
              <span className="w-[125px] flex-shrink-0 font-semibold text-black text-[9px]">PENYULANG</span>
              <span className="w-[10px] flex-shrink-0 font-bold text-black text-[9px]">:</span>
              <span className={`flex-grow flex items-center ${formData.penyulang ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                <InlineField value={formData.penyulang} onChange={(val) => handleFieldChange("penyulang", val)} placeholder=".........." className="font-mono text-black font-extrabold text-[9px] w-full" />
              </span>
            </div>
            
            <div className="flex items-center min-h-[15px]">
              <span className="w-[125px] flex-shrink-0 font-semibold text-black text-[9px]">SECTION LINE</span>
              <span className="w-[10px] flex-shrink-0 font-bold text-black text-[9px]">:</span>
              <span className={`flex-grow font-mono text-[9px] flex items-center ${formData.sectionLine ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                <PrintDropdown 
                  value={formData.sectionLine}
                  onChange={(val) => handleFieldChange("sectionLine", val)}
                  options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"]}
                  allowCustom={true}
                  placeholder="........"
                  className="text-[9px]"
                />
              </span>
            </div>

            <div className="flex items-center min-h-[15px]">
              <span className="w-[125px] flex-shrink-0 font-semibold text-black text-[9px]">BRANCH LINE ( L - R )</span>
              <span className="w-[10px] flex-shrink-0 font-bold text-black text-[9px]">:</span>
              <span className={`flex-grow font-mono text-[9px] flex items-center ${formData.branchLine ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                <PrintDropdown 
                  value={formData.branchLine}
                  onChange={(val) => handleFieldChange("branchLine", val)}
                  options={["1", "2", "3", "4", "5", "6", "7", "8", "9"]}
                  allowCustom={true}
                  placeholder="........"
                  className="text-[9px]"
                />
              </span>
            </div>

            <div className="flex items-center min-h-[15px]">
              <span className="w-[125px] flex-shrink-0 font-semibold text-black text-[9px]">NOMOR GARDU</span>
              <span className="w-[10px] flex-shrink-0 font-bold text-black text-[9px]">:</span>
              <span className={`flex-grow flex items-center ${formData.nomorGardu ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                <InlineField value={formData.nomorGardu} onChange={(val) => handleFieldChange("nomorGardu", val)} placeholder=".........." className="font-mono text-black font-extrabold text-[9px] w-full" />
              </span>
            </div>
            <div className="flex items-start min-h-[32px] overflow-hidden">
              <span className="w-[125px] flex-shrink-0 font-semibold text-black text-[9px] pt-[1px]">ALAMAT</span>
              <span className="w-[10px] flex-shrink-0 font-bold text-black text-[9px] pt-[1px]">:</span>
              <div className="flex-grow relative text-[9px] font-extrabold text-black leading-[13px] break-all break-words whitespace-normal text-wrap min-h-[26px]">
                {/* Visual dotted lines beneath text lines */}
                <div 
                  className="absolute inset-0 pointer-events-none" 
                  style={{
                    backgroundImage: "linear-gradient(to right, black 33%, rgba(255,255,255,0) 0%)",
                    backgroundPosition: "0 12px, 0 25px",
                    backgroundSize: "3px 1px",
                    backgroundRepeat: "repeat-x",
                    opacity: formData.alamat ? 0.35 : 1
                  }}
                />
                
                <div className="relative z-10 w-full">
                  <InlineField 
                    type="textarea"
                    value={formData.alamat} 
                    onChange={(val) => handleFieldChange("alamat", val)} 
                    placeholder=" " 
                    className="text-black font-extrabold text-[9px] w-full block break-all break-words whitespace-normal text-wrap leading-[13px] min-h-[26px]" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Jaringan Spec Matrix Table */}
          <div className="col-span-5 text-[8px] flex flex-col h-full py-0">
            <table className="border-collapse border-[1.5px] border-black w-full text-center h-full flex-1">
              <thead>
                <tr className="bg-slate-50 border-b border-black">
                  <th className="border-r border-black font-extrabold p-0.5 w-1/3 text-[8.5px] text-black">SUTR</th>
                  <th className="border-r border-black font-extrabold p-0.5 w-1/3 text-[8.5px] text-black">SUTM</th>
                  <th className="font-extrabold p-0.5 w-1/3 text-[8.5px] text-black">SKTM</th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1: Label Merek/Jenis */}
                <tr className="border-b border-black bg-slate-50/50 leading-tight">
                  <td className="border-r border-black text-[7.5px] font-semibold text-black py-0.5">Merek/Jenis</td>
                  <td className="border-r border-black text-[7.5px] font-semibold text-black py-0.5">Merek/Jenis</td>
                  <td className="text-[7.5px] font-semibold text-black py-0.5">Merek/Jenis</td>
                </tr>
                {/* Row 2: Input Merek/Jenis */}
                <tr className="border-b border-black leading-tight">
                  <td className="border-r border-black p-0.5">
                    <InlineField value={formData.sutrMerk} onChange={(val) => handleFieldChange("sutrMerk", val)} placeholder="............" className="font-mono text-[8.2px] text-black font-extrabold text-center" />
                  </td>
                  <td className="border-r border-black p-0.5">
                    <InlineField value={formData.sutmMerk} onChange={(val) => handleFieldChange("sutmMerk", val)} placeholder="............" className="font-mono text-[8.2px] text-black font-extrabold text-center" />
                  </td>
                  <td className="p-0.5">
                    <InlineField value={formData.sktmMerk} onChange={(val) => handleFieldChange("sktmMerk", val)} placeholder="............" className="font-mono text-[8.2px] text-black font-extrabold text-center" />
                  </td>
                </tr>
                {/* Row 3: Label Besar Penampang */}
                <tr className="border-b border-black bg-slate-50/50 leading-tight">
                  <td className="border-r border-black text-[7.5px] font-semibold text-black py-0.5">Besar Penampang</td>
                  <td className="border-r border-black text-[7.5px] font-semibold text-black py-0.5">Besar Penampang</td>
                  <td className="text-[7.5px] font-semibold text-black py-0.5">Besar Penampang</td>
                </tr>
                {/* Row 4: Input Besar Penampang */}
                <tr className="border-b border-black leading-tight">
                  <td className="border-r border-black p-0.5">
                    <InlineField value={formData.sutrPenampang} onChange={(val) => handleFieldChange("sutrPenampang", val)} placeholder="............" className="font-mono text-[8.2px] text-black font-extrabold text-center" />
                  </td>
                  <td className="border-r border-black p-0.5">
                    <InlineField value={formData.sutmPenampang} onChange={(val) => handleFieldChange("sutmPenampang", val)} placeholder="............" className="font-mono text-[8.2px] text-black font-extrabold text-center" />
                  </td>
                  <td className="p-0.5">
                    <InlineField value={formData.sktmPenampang} onChange={(val) => handleFieldChange("sktmPenampang", val)} placeholder="............" className="font-mono text-[8.2px] text-black font-extrabold text-center" />
                  </td>
                </tr>
                {/* Row 5: Label Panjang Jaringan */}
                <tr className="border-b border-black bg-slate-50/50 leading-tight">
                  <td className="border-r border-black text-[7.5px] font-semibold text-black py-0.5">Panjang Jaringan</td>
                  <td className="border-r border-black text-[7.5px] font-semibold text-black py-0.5">Panjang Jaringan</td>
                  <td className="text-[7.5px] font-semibold text-black py-0.5">Panjang Jaringan</td>
                </tr>
                {/* Row 6: Input Panjang Jaringan + Kms */}
                <tr className="leading-tight">
                  <td className="border-r border-black p-0.5">
                    <div className="flex items-center justify-center gap-1">
                      <InlineField value={formData.sutrPanjang} onChange={(val) => handleFieldChange("sutrPanjang", val)} placeholder="........" className="font-mono text-[8.2px] text-black font-extrabold text-center" />
                      <span className="text-[7.5px] font-semibold text-black">Kms</span>
                    </div>
                  </td>
                  <td className="border-r border-black p-0.5">
                    <div className="flex items-center justify-center gap-1">
                      <InlineField value={formData.sutmPanjang} onChange={(val) => handleFieldChange("sutmPanjang", val)} placeholder="........" className="font-mono text-[8.2px] text-black font-extrabold text-center" />
                      <span className="text-[7.5px] font-semibold text-black">Kms</span>
                    </div>
                  </td>
                  <td className="p-0.5">
                    <div className="flex items-center justify-center gap-1">
                      <InlineField value={formData.sktmPanjang} onChange={(val) => handleFieldChange("sktmPanjang", val)} placeholder="........" className="font-mono text-[8.2px] text-black font-extrabold text-center" />
                      <span className="text-[7.5px] font-semibold text-black">Kms</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
   
        {/* GRID SEC-2: TECHNICAL SPECIFICATIONS (TRAFO DRAFT CODES) */}
        <div className="mb-[0.5px] text-[8.5px] text-black font-semibold">
          <div className="space-y-[1px]">
            
            {/* Row 1 */}
            <div className="grid grid-cols-12 gap-2 text-black">
              <div className="col-span-7 flex items-center min-h-[12.5px]">
                <span className="w-[125px] flex-shrink-0 font-semibold text-black text-[8.5px]">MERK PERNIAGAAN</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <span className={`flex-grow ${formData.merkTrafo ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField value={formData.merkTrafo} onChange={(val) => handleFieldChange("merkTrafo", val)} placeholder=".........." className="font-mono text-black font-extrabold text-[8.5px] w-full" />
                </span>
              </div>
              <div className="col-span-5 flex items-center min-h-[12.5px]">
                <span className="w-[120px] flex-shrink-0 font-semibold text-black text-[8.5px]">Cara Pendinginan</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <span className="flex-grow border-b border-transparent font-mono text-black font-extrabold text-[8.5px]">
                  ONAN
                </span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-12 gap-2 text-black">
              <div className="col-span-7 flex items-center min-h-[12.5px]">
                <span className="w-[125px] flex-shrink-0 font-semibold text-black text-[8.5px]">NO. SERI TRAFO</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <span className={`flex-grow ${formData.noSeriTrafo ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField value={formData.noSeriTrafo} onChange={(val) => handleFieldChange("noSeriTrafo", val)} placeholder=".........." className="font-mono text-black font-extrabold text-[8.5px] w-full" />
                </span>
              </div>
              <div className="col-span-5 flex items-center min-h-[12.5px]">
                <span className="w-[120px] flex-shrink-0 font-semibold text-black text-[8.5px]">Jenis / Merk Minyak</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <span className="flex-grow border-b border-transparent font-mono text-black font-extrabold text-[8.5px] uppercase">
                  MINERAL
                </span>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-12 gap-2 text-black">
              <div className="col-span-7 flex items-center min-h-[12.5px]">
                <span className="w-[125px] flex-shrink-0 font-semibold text-black text-[8.5px]">DAYA PENGENAL</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <div className={`w-[95px] flex items-center justify-between gap-1 flex-shrink-0 ${formData.dayaTrafo ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <div className="flex-grow">
                    <InlineField 
                      value={formData.dayaTrafo} 
                      onChange={(val) => handleFieldChange("dayaTrafo", val)} 
                      placeholder=".........." 
                      type="select-or-text"
                      options={["25", "50", "100", "160", "200", "250"]}
                      className="font-mono text-black font-extrabold text-[8.5px] w-full text-center" 
                    />
                  </div>
                  <span className="font-extrabold text-black text-[7.5px] shrink-0 pr-0.5">KVA</span>
                </div>
              </div>
              <div className="col-span-5 flex items-center min-h-[12.5px]">
                <span className="w-[120px] flex-shrink-0 font-semibold text-black text-[8.5px]">BERAT MINYAK</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <div className={`w-[95px] flex items-center justify-between gap-1 flex-shrink-0 ${formData.beratMinyak ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <div className="flex-grow">
                    <InlineField 
                      value={formData.beratMinyak} 
                      onChange={(val) => handleFieldChange("beratMinyak", val)} 
                      placeholder=".........." 
                      className="font-mono text-black font-extrabold text-[8.5px] w-full text-center" 
                    />
                  </div>
                  <span className="font-extrabold text-black text-[7.5px] shrink-0 pr-0.5">Lt</span>
                </div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-12 gap-2 text-black">
              <div className="col-span-7 flex items-center min-h-[12.5px]">
                <span className="w-[125px] flex-shrink-0 font-semibold text-black text-[8.5px]">FREKUENSI SERI</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <div className={`w-[95px] flex items-center justify-between gap-1 flex-shrink-0 ${formData.frekuensiTrafo ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <div className="flex-grow">
                    <InlineField 
                      value={formData.frekuensiTrafo || "50"} 
                      onChange={(val) => handleFieldChange("frekuensiTrafo", val)} 
                      placeholder=".........." 
                      type="select-or-text"
                      options={["50"]}
                      className="font-mono text-black font-extrabold text-[8.5px] w-full text-center" 
                    />
                  </div>
                  <span className="font-extrabold text-black text-[7.5px] shrink-0 pr-0.5">Hz</span>
                </div>
              </div>
              <div className="col-span-5 flex items-center min-h-[12.5px]">
                <span className="w-[120px] flex-shrink-0 font-semibold text-black text-[8.5px]">BERAT TOTAL</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <div className={`w-[95px] flex items-center justify-between gap-1 flex-shrink-0 ${formData.beratTotal ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <div className="flex-grow">
                    <InlineField value={formData.beratTotal} onChange={(val) => handleFieldChange("beratTotal", val)} placeholder=".........." className="font-mono text-black font-extrabold text-[8.5px] w-full text-center" />
                  </div>
                  <span className="font-extrabold text-black text-[7.5px] shrink-0 pr-0.5">Kg</span>
                </div>
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-12 gap-2 text-black">
              <div className="col-span-7 flex items-center min-h-[12.5px]">
                <span className="w-[125px] flex-shrink-0 font-semibold text-black text-[8.5px]">JUMLAH FASE</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <div className="w-[95px] flex items-center justify-between gap-1 flex-shrink-0">
                  <div className="flex-grow font-mono font-extrabold text-[8.5px] text-center">3</div>
                  <span className="font-extrabold text-black text-[7.5px] shrink-0 pr-0.5 leading-none">( Tiga )</span>
                </div>
              </div>
              <div className="col-span-5 flex items-center min-h-[12.5px]">
                <span className="w-[120px] flex-shrink-0 font-semibold text-black text-[8.5px]">TINGKAT ISOLASI DASAR</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <span className={`flex-grow font-mono ${formData.tingkatIsolasi ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField value={formData.tingkatIsolasi} onChange={(val) => handleFieldChange("tingkatIsolasi", val)} placeholder=".........." className="font-mono text-black font-extrabold text-[8.5px]" />
                </span>
              </div>
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-12 gap-2 text-black">
              <div className="col-span-7 flex items-center min-h-[12.5px]">
                <span className="w-[125px] flex-shrink-0 font-semibold text-black text-[8.5px]">KELOMPOK VEKTOR</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <span className={`flex-grow ${formData.kelompokVektor ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField 
                    value={formData.kelompokVektor} 
                    onChange={(val) => handleFieldChange("kelompokVektor", val)} 
                    placeholder="Yzn5" 
                    type="select-or-text"
                    options={["Yzn5", "Dyn5", "Dyn11"]}
                    className="font-mono text-black font-bold text-[8.5px]" 
                  />
                </span>
              </div>
              <div className="col-span-5 flex items-center min-h-[12.5px]">
                <span className="w-[120px] flex-shrink-0 font-semibold text-black text-[8.5px]">TAHUN PEMBUATAN</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <span className={`flex-grow font-mono ${formData.tahunPembuatan ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField value={formData.tahunPembuatan} onChange={(val) => handleFieldChange("tahunPembuatan", val)} placeholder=".........." className="font-mono text-black font-extrabold text-[8.5px]" />
                </span>
              </div>
            </div>

            {/* Row 7 */}
            <div className="grid grid-cols-12 gap-2 text-black">
              <div className="col-span-7 flex items-center min-h-[12.5px]">
                <span className="w-[125px] flex-shrink-0 flex flex-col justify-center leading-tight">
                  <span className="font-bold text-[8px] text-black">TEGANGAN PENGENAL</span>
                  <span className="text-black font-semibold text-[7.5px] pl-1">- Primer</span>
                </span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <div className="flex items-center gap-1">
                  <span className="w-[80px] font-mono text-center text-black font-extrabold text-[8.5px]">20</span>
                  <span className="font-extrabold text-[7.5px] text-black">Kv</span>
                </div>
              </div>
              <div className="col-span-5 flex items-center min-h-[12.5px]">
                <span className="w-[120px] flex-shrink-0 font-semibold text-black text-[8.5px]">PABRIK PEMBUAT</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <span className={`flex-grow font-mono text-[8.5px] ${formData.pabrikPembuat ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField value={formData.pabrikPembuat} onChange={(val) => handleFieldChange("pabrikPembuat", val)} placeholder=".........." className="font-mono text-black font-extrabold w-full" />
                </span>
              </div>
            </div>

            {/* Row 8 */}
            <div className="grid grid-cols-12 gap-2 text-black">
              <div className="col-span-7 flex items-center min-h-[12.5px]">
                <span className="w-[125px] flex-shrink-0 flex flex-col justify-center leading-none">
                  <span className="text-black font-semibold text-[7.5px] pl-1">- Sekunder</span>
                </span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <div className="flex items-center gap-1">
                  <span className="w-[80px] font-mono text-center text-black font-extrabold text-[8.5px]">380/220</span>
                  <span className="font-bold text-[7.5px] text-black">Volt</span>
                </div>
              </div>
              <div className="col-span-5 flex items-center min-h-[12.5px]">
                <span>&nbsp;</span>
              </div>
            </div>

            {/* Row 9 */}
            <div className="grid grid-cols-12 gap-2 text-black">
              <div className="col-span-7 flex items-center min-h-[12.5px]">
                <span className="w-[125px] flex-shrink-0 flex flex-col justify-center leading-tight">
                  <span className="font-bold text-[8px] text-black">ARUS PENGENAL</span>
                  <span className="text-black font-semibold text-[7.5px] pl-1">- Primer</span>
                </span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <div className={`w-[95px] flex items-center justify-between gap-1 flex-shrink-0 ${formData.arusPrimer ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <div className="flex-grow">
                    <InlineField value={formData.arusPrimer} onChange={(val) => handleFieldChange("arusPrimer", val)} placeholder=".........." className="font-mono text-black font-extrabold text-[8.5px] w-full text-center" />
                  </div>
                  <span className="font-bold text-[7.5px] text-black shrink-0 pr-0.5">Amper</span>
                </div>
              </div>
              <div className="col-span-5 flex items-center min-h-[12.5px]">
                <span>&nbsp;</span>
              </div>
            </div>

            {/* Row 10 */}
            <div className="grid grid-cols-12 gap-2 text-black">
              <div className="col-span-7 flex items-center min-h-[12.5px]">
                <span className="w-[125px] flex-shrink-0 flex flex-col justify-center leading-none">
                  <span className="text-black font-semibold text-[7.5px] pl-1">- Sekunder</span>
                </span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <div className={`w-[95px] flex items-center justify-between gap-1 flex-shrink-0 ${formData.arusSekunder ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <div className="flex-grow">
                    <InlineField value={formData.arusSekunder} onChange={(val) => handleFieldChange("arusSekunder", val)} placeholder=".........." className="font-mono text-black font-extrabold text-[8.5px] w-full text-center" />
                  </div>
                  <span className="font-bold text-[7.5px] text-black shrink-0 pr-0.5">Amper</span>
                </div>
              </div>
              <div className="col-span-5 flex items-center min-h-[12.5px]">
                <span className="font-bold text-black tracking-wider text-[8px]">KONSTRUKSI TRAFO *</span>
              </div>
            </div>

            {/* Row 11 */}
            <div className="grid grid-cols-12 gap-2 text-black">
              <div className="col-span-7 flex items-center min-h-[12.5px]">
                <span className="w-[125px] flex-shrink-0 font-semibold text-black text-[8.5px]">IMPENDANS</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <div className={`w-[95px] flex items-center justify-between gap-1 flex-shrink-0 ${formData.impendans ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <div className="flex-grow">
                    <InlineField value={formData.impendans} onChange={(val) => handleFieldChange("impendans", val)} placeholder=".........." className="font-mono text-black font-extrabold text-[8.5px] w-full text-center" />
                  </div>
                  <span className="font-bold text-black text-[8px] shrink-0 pr-0.5">%</span>
                </div>
              </div>
              <div className="col-span-5 flex items-center min-h-[12.5px]">
                <span className="w-[120px] flex-shrink-0 font-bold text-black text-[8.5px]">TRANSFORMATOR</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <span className="flex-grow font-mono text-[8.5px] flex items-center">
                  <PrintDropdown 
                    value={formData.transformatorStatus || ""}
                    onChange={(val) => handleFieldChange("transformatorStatus", val)}
                    options={["Baru", "Mutasi", "Rekon", "Preman"]}
                    allowCustom={false}
                    placeholder="......"
                    className="text-[8.5px]"
                  />
                </span>
              </div>
            </div>

            {/* Row 12 */}
            <div className="grid grid-cols-12 gap-2 text-black">
              <div className="col-span-7 flex items-center min-h-[12.5px]">
                <span className="w-[125px] flex-shrink-0 font-semibold text-black text-[8.5px]">TAP TRAFO</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <div className={`w-[95px] flex items-center justify-between gap-1 flex-shrink-0 ${formData.tapTrafo ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <div className="w-[30px] flex-shrink-0">
                    <InlineField 
                       value={formData.tapTrafo || ""} 
                       onChange={(val) => handleFieldChange("tapTrafo", val)} 
                       placeholder="....." 
                       type="select-or-text"
                       options={["1", "2", "3", "4", "5", "6", "7"]}
                       className="font-mono text-black font-extrabold text-[8.5px] w-full text-center" 
                    />
                  </div>
                  <span className="font-extrabold text-[7.5px] text-black shrink-0 pr-0.5 leading-none flex items-center gap-[1px]">
                    <span>(</span>
                    <span className="font-mono text-black font-extrabold">{formData.tapTrafo || "..."}</span>
                    <span>/</span>
                    <span className="inline-block relative">
                      <InlineField
                        type="select"
                        options={["5", "7"]}
                        value={formData.tapTrafoMax || "5"}
                        onChange={(val) => handleFieldChange("tapTrafoMax", val)}
                        className="font-mono text-black font-extrabold text-[8.5px] min-w-[12px] p-0 border-b border-dotted border-black"
                      />
                    </span>
                    <span>)</span>
                  </span>
                </div>
              </div>
              <div className="col-span-5 flex items-center min-h-[12.5px]">
                <span className="w-[120px] flex-shrink-0 font-semibold text-black text-[8.5px]">BENGKEL / REKON *</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <span className="flex-grow font-mono text-[8.5px] flex items-center">
                  <PrintDropdown 
                    value={formData.bengkelRekon || ""}
                    onChange={(val) => handleFieldChange("bengkelRekon", val)}
                    options={["JP", "WEP", "TPJ", "MJ"]}
                    allowCustom={true}
                    placeholder="Lain"
                    className="text-[8.5px]"
                  />
                </span>
              </div>
            </div>

            {/* Row 13 */}
            <div className="grid grid-cols-12 gap-2 text-black">
              <div className="col-span-7 flex items-center min-h-[12.5px]">
                <span className="w-[125px] flex-shrink-0 font-semibold text-black text-[8.5px]">TEGANGAN TAP</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <span className={`flex-grow font-mono ${formData.teganganTap ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField 
                    value={formData.teganganTap || ""} 
                    onChange={(val) => handleFieldChange("teganganTap", val)} 
                    placeholder=".........." 
                    type="select-or-text"
                    options={[
                      "14.000", "14.500", "15.000", "15.500", "16.000", "16.500", 
                      "17.000", "17.500", "18.000", "18.500", "19.000", "19.500", 
                      "20.000", "20.500", "21.000"
                    ]}
                    className="font-mono text-black font-extrabold text-[8.5px]" 
                  />
                </span>
              </div>
              <div className="col-span-5 flex items-center min-h-[12.5px]">
                <span className="w-[120px] flex-shrink-0 font-semibold text-black text-[8.5px]">TRAFO *</span>
                <span className="w-[10px] flex-shrink-0 font-bold text-black text-[8.5px]">:</span>
                <span className="flex-grow font-mono text-[8.5px] flex items-center">
                  <PrintDropdown 
                    value={formData.trafoStatus || ""}
                    onChange={(val) => handleFieldChange("trafoStatus", val)}
                    options={["Khusus", "Umum"]}
                    allowCustom={false}
                    placeholder="Umum"
                    className="text-[8.5px]"
                  />
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* 3. TEST TAHANAN ISOLASI (MAGGER TEST) ZONE */}
        <div className="pt-2.5 mb-1.5 text-black font-semibold">
          <h3 className="text-left font-bold text-[8.5px] leading-tight tracking-tight uppercase text-black">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;TEST TAHANAN ISOLASI (MAGGER TEST) RATING MEGGER : 5000 VOLT / 20,000 M Ohm
          </h3>
        </div>

        {/* TABLE MAGGER TESTING GRID MATRIX */}
        <div className="grid grid-cols-4 gap-2 mb-3.5 text-[8px] font-medium leading-none text-black">
          
          {/* Column 1: PRIMER & SEKUNDAIR */}
          <div className="flex flex-col">
            <div className="font-extrabold text-[8px] uppercase tracking-wider text-center mb-0.5 text-black">
              PRIMER
            </div>
            <div className="space-y-[1px]">
              <MaggerRow label="R.G" field="meggerPrimerRG" />
              <MaggerRow label="S.G" field="meggerPrimerSG" />
              <MaggerRow label="T.G" field="meggerPrimerTG" />
              <MaggerRow label="R-S" field="meggerPrimerRS" />
              <MaggerRow label="R-T" field="meggerPrimerRT" />
              <MaggerRow label="S-T" field="meggerPrimerST" />
            </div>

            <div className="font-extrabold text-[8px] uppercase tracking-wider text-center mt-1 mb-[0.5px] text-black">
              SEKUNDAIR
            </div>
            <div className="space-y-[1px]">
              <MaggerRow label="R.G" field="meggerSekunderRG" />
              <MaggerRow label="S.G" field="meggerSekunderSG" />
              <MaggerRow label="T.G" field="meggerSekunderTG" />
              <MaggerRow label="R-S" field="meggerSekunderRS" />
              <MaggerRow label="R-T" field="meggerSekunderRT" />
              <MaggerRow label="S-T" field="meggerSekunderST" />
            </div>
          </div>

          {/* Column 2: PRIMER - SEKUNDAIR */}
          <div className="flex flex-col">
            <div className="font-extrabold text-[8px] uppercase tracking-wider text-center mb-0.5 w-full text-black">
              PRIMER - SEKUNDAIR
            </div>
            <div className="space-y-[1px]">
              <MaggerRow label="R - r" field="meggerPrimSekRR" labelWidthClass="w-10" />
              <MaggerRow label="R - s" field="meggerPrimSekRS" labelWidthClass="w-10" />
              <MaggerRow label="R - t" field="meggerPrimSekRT" labelWidthClass="w-10" />
              <MaggerRow label="R - n" field="meggerPrimSekRN" labelWidthClass="w-10" />
              
              <div className="h-[1px]"></div>

              <MaggerRow label="S - r" field="meggerPrimSekSR" labelWidthClass="w-10" />
              <MaggerRow label="S - s" field="meggerPrimSekSS" labelWidthClass="w-10" />
              <MaggerRow label="S - t" field="meggerPrimSekST" labelWidthClass="w-10" />
              <MaggerRow label="S - n" field="meggerPrimSekSN" labelWidthClass="w-10" />
              
              <div className="h-[1px]"></div>

              <MaggerRow label="T - r" field="meggerPrimSekTR" labelWidthClass="w-10" />
              <MaggerRow label="T - s" field="meggerPrimSekTS" labelWidthClass="w-10" />
              <MaggerRow label="T - t" field="meggerPrimSekTT" labelWidthClass="w-10" />
              <MaggerRow label="T - n" field="meggerPrimSekTN" labelWidthClass="w-10" />
            </div>
          </div>

          {/* Column 3: FUDENG/LINE SUTR & LINE SUTM */}
          <div className="flex flex-col">
            <div className="font-extrabold text-[8px] uppercase tracking-wider text-center mb-0.5 flex justify-center items-center gap-1 w-full text-black">
              <span className="whitespace-nowrap">FUDENG/LINE SUTR =</span>
              <InlineField 
                value={formData.sutrMemo || ""} 
                onChange={(v) => handleFieldChange("sutrMemo", v)} 
                placeholder="......" 
                className="bg-transparent text-center font-mono font-extrabold text-[8px] text-black" 
              />
            </div>
            <div className="space-y-[1px]">
              <MaggerRow label="R-G" field="meggerSutrRG" />
              <MaggerRow label="S-G" field="meggerSutrSG" />
              <MaggerRow label="T-G" field="meggerSutrTG" />
              <MaggerRow label="R-S" field="meggerSutrRS" />
              <MaggerRow label="R-T" field="meggerSutrRT" />
              <MaggerRow label="S-T" field="meggerSutrST" />
            </div>

            <div className="font-extrabold text-[8px] uppercase tracking-wider text-center mt-1 mb-[0.5px] text-black">
              LINE SUTM
            </div>
            <div className="space-y-[1px]">
              <MaggerRow label="R-G" field="meggerSutmRG" />
              <MaggerRow label="S-G" field="meggerSutmSG" />
              <MaggerRow label="T-G" field="meggerSutmTG" />
              <MaggerRow label="R-S" field="meggerSutmRS" />
              <MaggerRow label="R-T" field="meggerSutmRT" />
              <MaggerRow label="S-T" field="meggerSutmST" />
            </div>
          </div>

          {/* Column 4: EDITABLE SECONDARY SUTR & GROUNDING */}
          <div className="flex flex-col">
            <div className="font-extrabold text-[8px] uppercase tracking-wider text-center mb-0.5 flex justify-center items-center gap-1 w-full text-black">
              <span className="whitespace-nowrap">FUDENG/LINE SUTR =</span>
              <InlineField 
                value={formData.sutrKananMemo || ""} 
                onChange={(v) => handleFieldChange("sutrKananMemo", v)} 
                placeholder="......" 
                className="bg-transparent text-center font-mono font-extrabold text-[8px] text-black" 
              />
            </div>
            <div className="space-y-[1px]">
              <MaggerRow label="R-G" field="meggerSutrKananRG" />
              <MaggerRow label="S-G" field="meggerSutrKananSG" />
              <MaggerRow label="T-G" field="meggerSutrKananTG" />
              <MaggerRow label="R-S" field="meggerSutrKananRS" />
              <MaggerRow label="R-T" field="meggerSutrKananRT" />
              <MaggerRow label="S-T" field="meggerSutrKananST" />
            </div>

            <div className="font-extrabold text-[8px] uppercase tracking-wider text-center mt-1 mb-[0.5px] text-black">
              TEST PENTANAHAN GTT :
            </div>
            <div className="space-y-[1px]">
              <MaggerRow label="NETRAL" field="gttNetral" labelWidthClass="w-14" />
              <MaggerRow label="ARESTER" field="gttArester" labelWidthClass="w-14" />
              <MaggerRow label="BODY" field="gttBody" labelWidthClass="w-14" />
            </div>

            <div className="font-extrabold text-[8px] uppercase tracking-wider text-center mt-1 mb-[0.5px] text-black">
              TEST PENTANAHAN JTR UJUNG :
            </div>
            <div className="space-y-[1px]">
              <MaggerRow label="NETRAL" field="jtrUjungNetral" labelWidthClass="w-14" />
            </div>
          </div>

        </div>

        {/* 4. BOTTOM EXTRA MATRIX INFORMATION ZONE */}
        <div className="grid grid-cols-[3.8fr_4.4fr_3.8fr] gap-2 text-[8px] pt-0.5 leading-none text-black">
          
          {/* Column 1: FUDENG TRAFO & LYNE 1 & URUTAN FASA */}
          <div className="flex flex-col justify-between min-h-[125px] pr-1">
            <div>
              <div className="flex font-semibold items-center text-[8px] uppercase tracking-wider mb-1 text-black">
                <span className="font-extrabold whitespace-nowrap">FUDENG TRAFO :</span>
                <div className={`w-10 mx-1 flex items-center justify-center ${formData.fudengTrafoX ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField 
                    value={formData.fudengTrafoX || ""} 
                    onChange={(v) => handleFieldChange("fudengTrafoX", v)} 
                    placeholder="......" 
                    className="text-center font-mono font-bold w-full text-[8px]" 
                  />
                </div>
                <span className="mx-0.5 font-bold">X</span>
                <div className={`w-10 mx-1 flex items-center justify-center ${formData.fudengTrafoY ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField 
                    value={formData.fudengTrafoY || ""} 
                    onChange={(v) => handleFieldChange("fudengTrafoY", v)} 
                    placeholder="......" 
                    className="text-center font-mono font-bold w-full text-[8px]" 
                  />
                </div>
                <span className="ml-[2px] lowercase font-normal">mm</span>
              </div>

              <div className="space-y-[1px]">
                <MaggerRow label="R.G" field="fudengRG" labelWidthClass="w-8" />
                <MaggerRow label="S.G" field="fudengSG" labelWidthClass="w-8" />
                <MaggerRow label="T.G" field="fudengTG" labelWidthClass="w-8" />
                <MaggerRow label="R-S" field="fudengRS" labelWidthClass="w-8" />
                <MaggerRow label="R-T" field="fudengRT" labelWidthClass="w-8" />
                <MaggerRow label="S-T" field="fudengST" labelWidthClass="w-8" />
              </div>
            </div>

            <div className="mt-1 space-y-0.5 text-black font-semibold">
              <div className="flex items-center min-h-[12.5px] text-[8px] leading-none mb-0 text-black">
                <span className="w-[110px] flex-shrink-0 font-bold whitespace-nowrap text-left text-black">Merk Pembatas Lyne ......</span>
                <span className="w-[10px] flex-shrink-0 text-center font-bold font-mono text-black">:</span>
                <div className={`flex-grow mx-1 min-w-[20px] flex items-center justify-center ${formData.merkPembatasLyne ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField 
                    value={formData.merkPembatasLyne || ""} 
                    onChange={(v) => handleFieldChange("merkPembatasLyne", v)} 
                    placeholder=".........." 
                    className="font-mono text-center w-full font-bold text-[8px] text-black" 
                  />
                </div>
                <span className="w-3 flex-shrink-0"></span>
              </div>
              <div className="flex items-center min-h-[12.5px] text-[8px] leading-none mb-0 text-black">
                <span className="w-[110px] flex-shrink-0 font-bold whitespace-nowrap text-left text-black">Ampere pembatas Lyne</span>
                <span className="w-[10px] flex-shrink-0 text-center font-bold font-mono text-black">:</span>
                <div className={`flex-grow mx-1 min-w-[20px] flex items-center justify-center ${formData.amperePembatasLyne ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField 
                    value={formData.amperePembatasLyne || ""} 
                    onChange={(v) => handleFieldChange("amperePembatasLyne", v)} 
                    placeholder=".........." 
                    className="font-mono text-center w-full font-bold text-[8px] text-black" 
                  />
                </div>
                <span className="w-3 flex-shrink-0 text-right font-bold text-[8px] text-black font-mono">A</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[8px] font-bold mt-1 min-h-[12.5px] text-black">
              <span className="whitespace-nowrap font-bold text-[8px] text-black">Urutan Fasa &nbsp; R, S, T &nbsp; Ke :</span>
              <span className="font-mono inline-flex items-center text-black">
                <PrintDropdown 
                  value={formData.arahUrutanFasa || ""}
                  onChange={(val) => handleFieldChange("arahUrutanFasa", val)}
                  options={["KANAN", "KIRI"]}
                  allowCustom={false}
                  placeholder="KANAN"
                  className="text-[8px] text-black font-bold"
                />
              </span>
            </div>
          </div>

          {/* Column 2: PEMBATAS & SAKLAR DETAILS (MIDDLE) */}
          <div className="flex flex-col justify-between min-h-[125px] px-2">
            {/* Group 1: Pembatas Trafo */}
            <div className="space-y-[1px] text-black font-semibold">
              <div className="flex items-center min-h-[12.5px] text-[8px] leading-none mb-[0.5px] text-black">
                <span className="w-[130px] flex-shrink-0 font-bold whitespace-nowrap text-left text-black">Merk Pembatas Trafo</span>
                <span className="w-[10px] flex-shrink-0 text-center font-bold font-mono text-black">:</span>
                <div className={`flex-grow mx-1 min-w-[20px] flex items-center justify-center ${formData.merkPembatasTrafo ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField 
                    value={formData.merkPembatasTrafo || ""} 
                    onChange={(v) => handleFieldChange("merkPembatasTrafo", v)} 
                    placeholder="...................." 
                    className="font-mono text-center w-full font-bold ml-1 text-[8px] text-black" 
                  />
                </div>
                <span className="w-3 flex-shrink-0"></span>
              </div>
              <div className="flex items-center min-h-[12.5px] text-[8px] leading-none mb-[0.5px] text-black">
                <span className="w-[130px] flex-shrink-0 font-bold whitespace-nowrap text-left text-black">Ampere pembatas Trafo</span>
                <span className="w-[10px] flex-shrink-0 text-center font-bold font-mono text-black">:</span>
                <div className="flex-grow flex items-center justify-center gap-1 mx-1 min-w-[20px]">
                  <div className={`w-1/2 flex items-center justify-center ${(() => { const p = (formData.amperePembatasTrafo || "").split("x"); return p[0]?.trim() ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"; })()}`}>
                    <InlineField 
                      value={(() => {
                        const parts = (formData.amperePembatasTrafo || "").split("x");
                        return parts[0]?.trim() || "";
                      })()} 
                      onChange={(v) => {
                        const parts = (formData.amperePembatasTrafo || "").split("x").map(s => s.trim());
                        while (parts.length < 2) parts.push("");
                        parts[0] = v;
                        handleFieldChange("amperePembatasTrafo", parts.join(" x "));
                      }} 
                      placeholder="......" 
                      className="font-mono text-center w-full font-bold text-[8px] text-black" 
                    />
                  </div>
                  <span className="font-bold text-[8px] text-black font-mono">x</span>
                  <div className={`w-1/2 flex items-center justify-center ${(() => { const p = (formData.amperePembatasTrafo || "").split("x"); return p[1]?.trim() ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"; })()}`}>
                    <InlineField 
                      value={(() => {
                        const parts = (formData.amperePembatasTrafo || "").split("x");
                        return parts[1]?.trim() || "";
                      })()} 
                      onChange={(v) => {
                        const parts = (formData.amperePembatasTrafo || "").split("x").map(s => s.trim());
                        while (parts.length < 2) parts.push("");
                        parts[1] = v;
                        handleFieldChange("amperePembatasTrafo", parts.join(" x "));
                      }} 
                      placeholder="......" 
                      className="font-mono text-center w-full font-bold text-[8px] text-black" 
                    />
                  </div>
                </div>
                <span className="w-3 flex-shrink-0 text-right font-bold text-[8px] text-black">A</span>
              </div>
            </div>

            {/* Group 2: Saklar Utama */}
            <div className="space-y-[1px] text-black font-semibold">
              <div className="flex items-center min-h-[12.5px] text-[8px] leading-none mb-0 text-black">
                <span className="w-[130px] flex-shrink-0 font-bold whitespace-nowrap text-left text-black">Merk Saklar Utama</span>
                <span className="w-[10px] flex-shrink-0 text-center font-bold font-mono text-black">:</span>
                <div className={`flex-grow mx-1 min-w-[20px] flex items-center justify-center ${formData.merkSaklarUtama ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField 
                    value={formData.merkSaklarUtama || ""} 
                    onChange={(v) => handleFieldChange("merkSaklarUtama", v)} 
                    placeholder="...................." 
                    className="font-mono text-center w-full font-bold ml-1 text-[8px] text-black" 
                  />
                </div>
                <span className="w-3 flex-shrink-0"></span>
              </div>
              <div className="flex items-center min-h-[12.5px] text-[8px] leading-none mb-0 text-black">
                <span className="w-[130px] flex-shrink-0 font-bold whitespace-nowrap text-left text-black">Arus Nominasi Saklar Utama</span>
                <span className="w-[10px] flex-shrink-0 text-center font-bold font-mono text-black">:</span>
                <div className={`flex-grow mx-0.5 min-w-[20px] flex items-center justify-center ${formData.arusNominasiSaklarUtama ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField 
                    value={formData.arusNominasiSaklarUtama || ""} 
                    onChange={(v) => handleFieldChange("arusNominasiSaklarUtama", v)} 
                    placeholder="...................." 
                    className="font-mono text-center w-full font-bold ml-1 text-[8px] text-black" 
                  />
                </div>
                <span className="w-3 flex-shrink-0 text-right font-bold text-[8px] text-black font-mono">A</span>
              </div>
            </div>

            {/* Group 3: Pembatas Utama */}
            <div className="space-y-[1px] text-black font-semibold">
              <div className="flex items-center min-h-[12.5px] text-[8px] leading-none mb-0 text-black">
                <span className="w-[130px] flex-shrink-0 font-bold whitespace-nowrap text-left text-black">Merk Pembatas Utama</span>
                <span className="w-[10px] flex-shrink-0 text-center font-bold font-mono text-black">:</span>
                <div className={`flex-grow mx-1 min-w-[20px] flex items-center justify-center ${formData.merkPembatasUtama ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField 
                    value={formData.merkPembatasUtama || ""} 
                    onChange={(v) => handleFieldChange("merkPembatasUtama", v)} 
                    placeholder="...................." 
                    className="font-mono text-center w-full font-bold ml-1 text-[8px] text-black" 
                  />
                </div>
                <span className="w-3 flex-shrink-0"></span>
              </div>
              <div className="flex items-center min-h-[12.5px] text-[8px] leading-none mb-0 text-black">
                <span className="w-[130px] flex-shrink-0 font-bold whitespace-nowrap text-left text-black">Ampere Pembatas Utama</span>
                <span className="w-[10px] flex-shrink-0 text-center font-bold font-mono text-black">:</span>
                <div className={`flex-grow mx-1 min-w-[20px] flex items-center justify-center ${formData.amperePembatasUtama ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField 
                    value={formData.amperePembatasUtama || ""} 
                    onChange={(v) => handleFieldChange("amperePembatasUtama", v)} 
                    placeholder="...................." 
                    className="font-mono text-center w-full font-bold ml-1 text-[8px] text-black" 
                  />
                </div>
                <span className="w-3 flex-shrink-0 text-right font-bold text-[8px] text-black font-mono">A</span>
              </div>
            </div>

            {/* Group 4: Pembatas Lyne 2 */}
            <div className="space-y-[1px] text-black font-semibold">
              <div className="flex items-center min-h-[12.5px] text-[8px] leading-none mb-0 text-black">
                <span className="w-[130px] flex-shrink-0 font-bold whitespace-nowrap text-left text-black">Merk Pembatas Lyne ......</span>
                <span className="w-[10px] flex-shrink-0 text-center font-bold font-mono text-black">:</span>
                <div className={`flex-grow mx-1 min-w-[20px] flex items-center justify-center ${formData.merkPembatasLyne2 ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField 
                    value={formData.merkPembatasLyne2 || ""} 
                    onChange={(v) => handleFieldChange("merkPembatasLyne2", v)} 
                    placeholder="...................." 
                    className="font-mono text-center w-full font-bold ml-1 text-[8px] text-black" 
                  />
                </div>
                <span className="w-3 flex-shrink-0"></span>
              </div>
              <div className="flex items-center min-h-[12.5px] text-[8px] leading-none mb-0 text-black">
                <span className="w-[130px] flex-shrink-0 font-bold whitespace-nowrap text-left text-black">Ampere Pembatas Lyne</span>
                <span className="w-[10px] flex-shrink-0 text-center font-bold font-mono text-black">:</span>
                <div className={`flex-grow mx-1 min-w-[20px] flex items-center justify-center font-mono text-black ${formData.amperePembatasLyne2 ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                  <InlineField 
                    value={formData.amperePembatasLyne2 || ""} 
                    onChange={(v) => handleFieldChange("amperePembatasLyne2", v)} 
                    placeholder="...................." 
                    className="font-mono text-center w-full font-bold ml-1 text-[8px] text-black" 
                  />
                </div>
                <span className="w-3 flex-shrink-0 text-right font-bold text-[8px] text-black font-mono">A</span>
              </div>
            </div>
          </div>

          {/* Column 3: TEGANGAN SEKUNDAIR & KETERANGAN (RIGHT) */}
          <div className="flex flex-col justify-between min-h-[125px] pl-1">
            <div>
              <div className="font-extrabold text-[8px] uppercase tracking-wider mb-1 text-black">
                TEGANGAN SEKUNDAIR
              </div>

              <div className="space-y-[1px]">
                <VoltRow label="R - 0" field="voltRN" />
                <VoltRow label="S - 0" field="voltSN" />
                <VoltRow label="T - 0" field="voltTN" />
                
                <div className="h-[1px]"></div>

                <VoltRow label="R - S" field="voltRS" />
                <VoltRow label="R - T" field="voltRT" />
                <VoltRow label="S - T" field="voltST" />
              </div>
            </div>

            <div className="mt-1 text-[8px] leading-relaxed text-black">
              <div className="font-extrabold mb-0.5 uppercase tracking-wider text-black">KETERANGAN :</div>
              <div className="flex items-center gap-1 font-bold mb-1 text-black">
                <span className="font-mono text-[8px] inline-flex items-center">
                  <PrintDropdown 
                    value={formData.keteranganOperasi || ""}
                    onChange={(val) => handleFieldChange("keteranganOperasi", val)}
                    options={["SUDAH", "BELUM"]}
                    allowCustom={false}
                    placeholder="SUDAH"
                    className="text-[8px]"
                  />
                </span>
                <span className="text-[8px] font-semibold text-black ml-1">Dioperasikan</span>
              </div>
              <div className="space-y-0.5 text-black">
                <div className="flex items-center min-h-[12.5px]">
                  <span className="w-10 font-bold text-black font-sans">Jam</span>
                  <span className="w-2 text-center font-bold font-mono text-black">:</span>
                  <div className={`flex-grow mx-1 min-w-[20px] flex items-center justify-center ${formData.jamOperasi ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                    <InlineField 
                      value={formData.jamOperasi || ""} 
                      onChange={(v) => handleFieldChange("jamOperasi", v)} 
                      placeholder="..................." 
                      className="font-mono font-bold text-center w-full text-[8px] text-black" 
                    />
                  </div>
                  <span className="w-6 text-right font-extrabold text-[8px] text-black">WIB</span>
                </div>
                <div className="flex items-center min-h-[12.5px]">
                  <span className="w-10 font-bold text-black font-sans">Tanggal</span>
                  <span className="w-2 text-center font-bold font-mono text-black">:</span>
                  <div className={`flex-grow mx-1 min-w-[20px] flex items-center justify-center ${formData.tanggalOperasi ? "border-b border-transparent print:border-b-0" : "border-b border-dotted border-black"}`}>
                    <InlineField 
                      value={formData.tanggalOperasi || ""} 
                      onChange={(v) => handleFieldChange("tanggalOperasi", v)} 
                      placeholder="..................." 
                      className="font-mono font-bold text-center w-full text-[8px] text-black" 
                    />
                  </div>
                  <span className="w-6"></span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM STATEMENT & SIGNATURE ZONE */}
        <div className="text-[9.5px] space-y-1 mt-1 leading-normal text-black font-normal">
          <div className="text-left py-0.5 text-[9.5px] text-black pl-[6ch] font-medium leading-relaxed">
            Demikian pernyataan ini dibuat dengan sebenarnya untuk dipergunakan seperlunya.
          </div>

          {/* Signature block with three Columns - LOOSENED FOR PRINTING */}
          <div className="grid grid-cols-3 text-center pt-1.5 text-[9px] leading-relaxed text-black font-bold">
            <div className="flex flex-col h-[104px] justify-between relative">
              <div className="text-black font-semibold">Petugas Operasi Area Madiun</div>
              
              {/* INTERACTIVE SIGNATURE BOX */}
              <div 
                onClick={() => setSignatureModal({
                  isOpen: true,
                  field: "signaturePetugasMadiun",
                  title: "Tanda Tangan Petugas Operasi Area Madiun"
                })}
                className="flex-grow flex items-center justify-center relative cursor-pointer group/sig"
              >
                {formData.signaturePetugasMadiun ? (
                  <div className="relative inline-block">
                    <img 
                      src={formData.signaturePetugasMadiun} 
                      alt="Signature" 
                      className="h-[62px] max-w-full object-contain mx-auto" 
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFieldChange("signaturePetugasMadiun", "");
                      }}
                      className="absolute -top-1 -right-4 bg-rose-500 hover:bg-rose-600 text-white p-0.5 rounded shadow-xs opacity-0 group-hover/sig:opacity-100 transition-opacity no-print cursor-pointer"
                      title="Hapus Tanda Tangan"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-transparent group-hover/sig:bg-sky-500/5 rounded transition-all no-print">
                    <span className="text-[8px] text-slate-300 font-medium opacity-0 group-hover/sig:opacity-100 transition-opacity">
                      ✍️ Klik untuk Tanda Tangan
                    </span>
                  </div>
                )}
              </div>

              <div className="font-extrabold text-black pb-0.5 flex items-center justify-center">
                <InlineField value={formData.namaPetugasMadiun} onChange={(v) => handleFieldChange("namaPetugasMadiun", v)} placeholder="..................................." className="font-extrabold text-black text-[9px]" />
              </div>
            </div>
            
            <div className="flex flex-col h-[104px] justify-between relative">
              <div className="text-black font-extrabold">PT. PLN (Persero) ULP Mantingan</div>
              
              {/* INTERACTIVE SIGNATURE BOX */}
              <div 
                onClick={() => setSignatureModal({
                  isOpen: true,
                  field: "signaturePimpinanUlp",
                  title: "Tanda Tangan PT. PLN (Persero) ULP Mantingan"
                })}
                className="flex-grow flex items-center justify-center relative cursor-pointer group/sig"
              >
                {formData.signaturePimpinanUlp ? (
                  <div className="relative inline-block">
                    <img 
                      src={formData.signaturePimpinanUlp} 
                      alt="Signature" 
                      className="h-[62px] max-w-full object-contain mx-auto" 
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFieldChange("signaturePimpinanUlp", "");
                      }}
                      className="absolute -top-1 -right-4 bg-rose-500 hover:bg-rose-600 text-white p-0.5 rounded shadow-xs opacity-0 group-hover/sig:opacity-100 transition-opacity no-print cursor-pointer"
                      title="Hapus Tanda Tangan"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-transparent group-hover/sig:bg-sky-500/5 rounded transition-all no-print">
                    <span className="text-[8px] text-slate-300 font-medium opacity-0 group-hover/sig:opacity-100 transition-opacity">
                      ✍️ Klik untuk Tanda Tangan
                    </span>
                  </div>
                )}
              </div>

              <div className="font-extrabold text-black pb-0.5 flex items-center justify-center">
                <InlineField value={formData.namaPimpinanUlp} onChange={(v) => handleFieldChange("namaPimpinanUlp", v)} placeholder="..................................." className="font-extrabold text-black text-[9px]" />
              </div>
            </div>

            <div className="flex flex-col h-[104px] justify-between relative">
              <div className="text-black font-semibold">Pelaksana</div>
              
              {/* INTERACTIVE SIGNATURE BOX */}
              <div 
                onClick={() => setSignatureModal({
                  isOpen: true,
                  field: "signaturePelaksana",
                  title: "Tanda Tangan Pelaksana"
                })}
                className="flex-grow flex items-center justify-center relative cursor-pointer group/sig"
              >
                {formData.signaturePelaksana ? (
                  <div className="relative inline-block">
                    <img 
                      src={formData.signaturePelaksana} 
                      alt="Signature" 
                      className="h-[62px] max-w-full object-contain mx-auto" 
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFieldChange("signaturePelaksana", "");
                      }}
                      className="absolute -top-1 -right-4 bg-rose-500 hover:bg-rose-600 text-white p-0.5 rounded shadow-xs opacity-0 group-hover/sig:opacity-100 transition-opacity no-print cursor-pointer"
                      title="Hapus Tanda Tangan"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-transparent group-hover/sig:bg-sky-500/5 rounded transition-all no-print">
                    <span className="text-[8px] text-slate-300 font-medium opacity-0 group-hover/sig:opacity-100 transition-opacity">
                      ✍️ Klik untuk Tanda Tangan
                    </span>
                  </div>
                )}
              </div>

              <div className="font-extrabold text-black pb-0.5 flex items-center justify-center relative w-full">
                <div className="relative inline-block w-full max-w-[140px]">
                  <InlineField value={formData.namaPelaksana} onChange={(v) => handleFieldChange("namaPelaksana", v)} placeholder="..................................." className="font-extrabold text-black text-[9px]" />
                  
                  {/* DOCUMENT REVISION METADATA STAMP */}
                  <div className="absolute left-[104%] bottom-[-1px] flex flex-col text-[7px] leading-[1.1] text-black font-bold text-left whitespace-nowrap select-none">
                    <div>FS. 10-03</div>
                    <div>Revisi – 1</div>
                    <div>Tgl. 30032014</div>
                    <div>1 / 2</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Signature drawing modal wrapper */}
      {signatureModal?.isOpen && (
        <SignaturePadModal
          isOpen={signatureModal.isOpen}
          onClose={() => setSignatureModal(null)}
          onSave={(dataUri) => handleFieldChange(signatureModal.field, dataUri)}
          title={signatureModal.title}
          initialValue={(formData as any)[signatureModal.field] || ""}
        />
      )}
    </div>
  );
}
