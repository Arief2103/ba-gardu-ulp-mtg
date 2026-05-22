import React, { useState, useEffect, useRef } from "react";

interface InlineFieldProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: "text" | "select" | "number" | "select-or-text" | "textarea";
  options?: string[] | { value: string; label: string }[];
  className?: string;
  inputClassName?: string;
}

export default function InlineField({
  value,
  onChange,
  placeholder = "...................",
  type = "text",
  options = [],
  className = "",
  inputClassName = "",
}: InlineFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleSave();
      }
    }
    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, tempValue]);

  if (isEditing) {
    if (type === "select") {
      return (
        <div ref={containerRef} className="inline-block no-print">
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            className={`px-1 py-0.5 bg-slate-50 border border-black rounded text-xs text-black focus:outline-none ${inputClassName}`}
          >
            <option value="">-- Pilih --</option>
            {options.map((opt) => {
              const isObj = typeof opt === "object" && opt !== null;
              const val = isObj ? (opt as { value: string }).value : opt;
              const lbl = isObj ? (opt as { label: string }).label : opt;
              return (
                <option key={String(val)} value={String(val)}>
                  {String(lbl)}
                </option>
              );
            })}
          </select>
        </div>
      );
    }

    if (type === "select-or-text") {
      // Supports choice of options OR typing manually
      return (
        <div ref={containerRef} className="inline-flex items-center gap-1 no-print">
          <select
            value={options.some((opt) => (typeof opt === "object" ? opt.value === tempValue : opt === tempValue)) ? tempValue : "custom"}
            onChange={(e) => {
              const val = e.target.value;
              if (val !== "custom") {
                setTempValue(val);
              } else {
                setTempValue("");
              }
            }}
            className="px-1 py-0.5 bg-slate-50 border border-black rounded text-xs select-none max-w-[100px] text-black"
          >
            <option value="">-- Pilih --</option>
            {options.map((opt) => {
              const isObj = typeof opt === "object" && opt !== null;
              const val = isObj ? (opt as { value: string }).value : opt;
              const lbl = isObj ? (opt as { label: string }).label : opt;
              return (
                <option key={String(val)} value={String(val)}>
                  {String(lbl)}
                </option>
              );
            })}
            <option value="custom">Kustom...</option>
          </select>
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`px-1 py-0.5 bg-slate-50 border border-black rounded text-xs focus:outline-none max-w-[120px] text-black ${inputClassName}`}
            placeholder="Ketik..."
          />
        </div>
      );
    }

    if (type === "textarea") {
      return (
        <div ref={containerRef} className="no-print min-w-[220px] w-full max-w-[400px]">
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              } else if (e.key === "Escape") {
                setTempValue(value);
                setIsEditing(false);
              }
            }}
            rows={2}
            className={`px-1 py-1 bg-slate-50 border border-black rounded text-xs focus:outline-none w-full text-black leading-tight ${inputClassName}`}
            placeholder={placeholder}
          />
        </div>
      );
    }

    return (
      <div ref={containerRef} className="inline-block no-print">
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type === "number" ? "number" : "text"}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={`px-1 py-0 bg-slate-50 border border-black rounded text-xs font-mono focus:outline-none min-w-[50px] w-full text-black max-w-[200px] ${inputClassName}`}
        />
      </div>
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      title="Klik untuk mengedit langsung"
      className={`cursor-pointer hover:bg-slate-50 hover:text-black transition-colors rounded px-0.5 relative group border-b border-transparent hover:border-black/50 ${
        value ? "text-black font-extrabold" : "text-black font-mono font-bold"
      } ${className}`}
    >
      {value || placeholder}
      <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity no-print pointer-events-none whitespace-nowrap z-50">
        Klik edit langsung
      </span>
    </span>
  );
}
