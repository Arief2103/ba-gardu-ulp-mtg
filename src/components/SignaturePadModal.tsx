import React, { useRef, useState, useEffect } from "react";
import { X, Trash2, Check, Palette } from "lucide-react";

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUri: string) => void;
  title: string;
  initialValue?: string;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  initialValue,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [inkColor, setInkColor] = useState<"black" | "#000080">("black"); // Deep black or navy blue
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Trigger a tiny delay to ensure the canvas has mounted and its client bounding rect is ready
      const timer = setTimeout(() => {
        initCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear and set high resolution (2x DPI) for sharp lines
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = inkColor;

    // Load initial signature if exists, to allow editing or reviewing
    if (initialValue) {
      const img = new Image();
      img.onload = () => {
        // Draw image scaled to display block
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setIsCanvasEmpty(false);
      };
      img.src = initialValue;
    } else {
      clearCanvas();
    }
  };

  // Keep stroke style in sync with selected color
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = inkColor;
      }
    }
  }, [inkColor]);

  const getCoordinates = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e.nativeEvent);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setIsCanvasEmpty(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e.nativeEvent);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsCanvasEmpty(true);
  };

  const handleSaveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || isCanvasEmpty) return;

    // Convert high-res canvas back to base64 data URL
    const dataUri = canvas.toDataURL("image/png");
    onSave(dataUri);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs no-print">
      <div 
        id="signature-modal-box"
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400">Tanda Tangan Digital</span>
            <h3 className="text-sm font-bold text-slate-800 leading-tight mt-0.5">{title}</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body & Canvas */}
        <div className="p-5 space-y-4">
          <span className="text-[11px] text-slate-500 font-medium block">
            Gunakan mouse, stylus, atau jari Anda untuk mencoret-coret tanda tangan di bawah ini:
          </span>

          <div className="relative w-full h-[180px] bg-slate-50 border border-slate-300 rounded-lg overflow-hidden flex items-center justify-center">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair touch-none"
              style={{ touchAction: "none" }}
            />

            {/* Instruction placeholder when canvas is empty */}
            {isCanvasEmpty && (
              <span className="absolute pointer-events-none text-xs text-slate-300 font-medium">
                Sila coret-coret di sini...
              </span>
            )}
          </div>

          {/* Color Palettes and Quick actions */}
          <div className="flex items-center justify-between">
            {/* Color selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Palette size={12} /> Warna Tinta:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setInkColor("black")}
                  className={`w-5 h-5 rounded-full bg-black border-2 flex items-center justify-center transition-all cursor-pointer ${
                    inkColor === "black" ? "border-sky-500 scale-110" : "border-transparent"
                  }`}
                  title="Tinta Hitam"
                />
                <button
                  type="button"
                  onClick={() => setInkColor("#000080")}
                  className={`w-5 h-5 rounded-full bg-navy border-2 flex items-center justify-center bg-[#000080] transition-all cursor-pointer ${
                    inkColor === "#000080" ? "border-sky-500 scale-110" : "border-transparent"
                  }`}
                  title="Tinta Biru"
                />
              </div>
            </div>

            {/* Clear Button */}
            <button
              type="button"
              onClick={clearCanvas}
              disabled={isCanvasEmpty}
              className="px-3 py-1.5 border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-rose-500 rounded-md font-medium text-xs flex items-center gap-1 cursor-pointer transition-all"
            >
              <Trash2 size={13} />
              <span>Bersihkan</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveSignature}
            disabled={isCanvasEmpty}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Check size={14} />
            <span>Simpan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
