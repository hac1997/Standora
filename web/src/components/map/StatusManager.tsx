"use client";

import { useState } from "react";
import ColorPicker from "./ColorPicker";

export interface StatusDef {
  key: string;
  label: string;
  color: string;
}

export const DEFAULT_STATUSES: StatusDef[] = [
  { key: "disponivel", label: "Disponível", color: "#22c55e" },
  { key: "reservado", label: "Reservado", color: "#f59e0b" },
  { key: "ocupado", label: "Ocupado", color: "#64748b" },
];

interface StatusManagerProps {
  statuses: StatusDef[];
  onChange: (statuses: StatusDef[]) => void;
}

export default function StatusManager({ statuses, onChange }: StatusManagerProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#3b82f6");
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("");

  function startEdit(s: StatusDef) {
    setEditing(s.key);
    setEditLabel(s.label);
    setEditColor(s.color);
  }

  function saveEdit(key: string) {
    onChange(statuses.map((s) => s.key === key ? { ...s, label: editLabel, color: editColor } : s));
    setEditing(null);
  }

  function deleteStatus(key: string) {
    onChange(statuses.filter((s) => s.key !== key));
  }

  function addStatus() {
    if (!newLabel.trim()) return;
    const key = `status_${Date.now()}`;
    onChange([...statuses, { key, label: newLabel.trim(), color: newColor }]);
    setNewLabel("");
    setNewColor("#3b82f6");
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1.5 rounded-lg text-sm font-medium border bg-white text-slate-700 border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
      >
        <span>⚙️ Status</span>
        {/* Color chips preview */}
        <span className="flex gap-0.5">
          {statuses.slice(0, 4).map((s) => (
            <span key={s.key} className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: s.color }} />
          ))}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-10 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-800 text-sm">Gerenciar Status</h4>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
          </div>

          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto pr-1">
            {statuses.map((s) => (
              <div key={s.key}>
                {editing === s.key ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      placeholder="Nome do status"
                    />
                    <ColorPicker value={editColor} onChange={setEditColor} />
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => saveEdit(s.key)}
                        className="flex-1 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800">
                        Salvar
                      </button>
                      <button onClick={() => setEditing(null)}
                        className="flex-1 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-xs hover:bg-slate-50">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 group">
                    <span className="w-4 h-4 rounded-full shrink-0 border border-black/10" style={{ backgroundColor: s.color }} />
                    <span className="flex-1 text-sm text-slate-700">{s.label}</span>
                    <span className="text-xs text-slate-400 font-mono">{s.color}</span>
                    <button onClick={() => startEdit(s)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 text-xs px-1.5 py-0.5 rounded transition-opacity">
                      ✏️
                    </button>
                    {statuses.length > 1 && (
                      <button onClick={() => deleteStatus(s.key)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs px-1.5 py-0.5 rounded transition-opacity">
                        ×
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add new */}
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <p className="text-xs font-medium text-slate-500 mb-1.5">Adicionar status</p>
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addStatus()}
              placeholder="Ex: Patrocinador Premium"
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <ColorPicker value={newColor} onChange={setNewColor} />
            <button onClick={addStatus} disabled={!newLabel.trim()}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-40 transition-colors mt-1">
              + Adicionar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
