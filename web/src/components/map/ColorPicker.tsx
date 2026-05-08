"use client";

import { useEffect, useRef, useState } from "react";

const PALETTE = [
  // Verdes
  "#22c55e", "#16a34a", "#4ade80", "#86efac",
  // Âmbares
  "#f59e0b", "#eab308", "#fbbf24", "#fde68a",
  // Laranjas
  "#f97316", "#ea580c", "#fb923c", "#fed7aa",
  // Vermelhos
  "#ef4444", "#dc2626", "#f87171", "#e11d48",
  // Azuis
  "#3b82f6", "#2563eb", "#60a5fa", "#0ea5e9",
  // Roxos
  "#8b5cf6", "#7c3aed", "#a78bfa", "#6366f1",
  // Cinzas / Neutros
  "#64748b", "#475569", "#94a3b8", "#1e293b",
];

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [hex, setHex] = useState(value);
  const [hexError, setHexError] = useState(false);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 224 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Sync prop → internal state when parent changes value
  useEffect(() => { setHex(value); }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const drop = document.getElementById("cp-dropdown");
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (drop?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function toggle() {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left, width: r.width });
    }
    setOpen((o) => !o);
  }

  function handleHexInput(raw: string) {
    setHex(raw);
    const clean = raw.startsWith("#") ? raw : `#${raw}`;
    const valid = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(clean);
    setHexError(!valid);
    if (valid) onChange(clean);
  }

  function pick(color: string) {
    setHex(color);
    setHexError(false);
    onChange(color);
    setOpen(false);
  }

  const displayBg = hexError ? "#f1f5f9" : (hex.startsWith("#") ? hex : `#${hex}`);

  return (
    <>
      {/* ── Trigger (looks like a select / input) ── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className="w-full flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 text-left"
      >
        {/* Current color swatch */}
        <span
          className="w-5 h-5 rounded shrink-0 border border-black/10 shadow-sm"
          style={{ backgroundColor: displayBg }}
        />
        {/* Hex value */}
        <span className="flex-1 text-xs font-mono text-slate-500 truncate">
          {hex || value || "#000000"}
        </span>
        {/* Chevron */}
        <svg
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Floating dropdown (fixed, bypasses sidebar overflow clipping) ── */}
      {open && (
        <div
          id="cp-dropdown"
          style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-xl shadow-2xl p-3 space-y-2.5"
        >
          {/* 8-column compact grid */}
          <div className="grid grid-cols-8 gap-1.5">
            {PALETTE.map((color) => {
              const selected = value.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  type="button"
                  title={color}
                  onClick={() => pick(color)}
                  className="w-6 h-6 rounded transition-transform hover:scale-110 focus:outline-none"
                  style={{
                    backgroundColor: color,
                    boxShadow: selected
                      ? `0 0 0 2px white, 0 0 0 4px ${color}`
                      : "inset 0 0 0 1px rgba(0,0,0,0.08)",
                  }}
                />
              );
            })}
          </div>

          {/* Hex input row */}
          <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100">
            <span
              className="w-6 h-6 rounded border border-slate-200 shrink-0 shadow-sm"
              style={{ backgroundColor: displayBg }}
            />
            <input
              type="text"
              value={hex}
              maxLength={7}
              onChange={(e) => handleHexInput(e.target.value)}
              placeholder="#22c55e"
              spellCheck={false}
              className={`flex-1 px-2 py-1 border rounded text-xs font-mono focus:outline-none focus:ring-1 ${
                hexError
                  ? "border-red-400 focus:ring-red-400 bg-red-50 text-red-700"
                  : "border-slate-300 focus:ring-slate-900 bg-white"
              }`}
            />
          </div>
        </div>
      )}
    </>
  );
}
