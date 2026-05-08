"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_FLOW: Record<string, { label: string; next: string; color: string }[]> = {
  rascunho:     [{ label: "Publicar",        next: "publicado",    color: "indigo" }],
  publicado:    [{ label: "Iniciar Evento",  next: "em_andamento", color: "emerald" },
                 { label: "Despublicar",     next: "rascunho",     color: "gray" }],
  em_andamento: [{ label: "Encerrar Evento", next: "encerrado",    color: "amber" }],
  encerrado:    [],
};

const COLOR_CLASSES: Record<string, string> = {
  indigo:  "bg-indigo-600 hover:bg-indigo-700 text-white",
  emerald: "bg-emerald-600 hover:bg-emerald-700 text-white",
  amber:   "bg-amber-500 hover:bg-amber-600 text-white",
  gray:    "bg-gray-100 hover:bg-gray-200 text-gray-700",
};

const TYPE_OPTIONS = [
  { value: "feira",       label: "Feira" },
  { value: "exposicao",   label: "Exposição" },
  { value: "congresso",   label: "Congresso" },
  { value: "festival",    label: "Festival" },
  { value: "corporativo", label: "Corporativo" },
  { value: "outro",       label: "Outro" },
];

interface Event {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  estimatedParticipants: number;
  estimatedExhibitors: number;
}

interface Props {
  event: Event;
}

export default function EventActions({ event }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [form, setForm] = useState({
    name: event.name,
    description: event.description ?? "",
    type: event.type,
    startDate: event.startDate.slice(0, 10),
    endDate: event.endDate.slice(0, 10),
    estimatedParticipants: event.estimatedParticipants,
    estimatedExhibitors: event.estimatedExhibitors,
  });

  async function patch(data: Record<string, unknown>, loadingKey: string) {
    setLoading(loadingKey);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Falha na atualização");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleStatusChange(next: string) {
    await patch({ status: next }, `status-${next}`);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    await patch(form, "edit");
    setShowEdit(false);
  }

  async function handleDelete() {
    if (deleteConfirm !== event.name) return;
    setLoading("delete");
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir");
      router.push("/dashboard/events");
    } finally {
      setLoading(null);
    }
  }

  const transitions = STATUS_FLOW[event.status] ?? [];

  return (
    <>
      {/* Action bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {transitions.map((t) => (
          <button
            key={t.next}
            onClick={() => handleStatusChange(t.next)}
            disabled={!!loading}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${COLOR_CLASSES[t.color]}`}
          >
            {loading === `status-${t.next}` ? "Salvando..." : t.label}
          </button>
        ))}
        <button
          onClick={() => setShowEdit(true)}
          className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
        >
          ✏️ Editar dados
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="px-4 py-2 rounded-lg text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
        >
          🗑 Excluir evento
        </button>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Editar Evento</h2>
              <button onClick={() => setShowEdit(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nome do evento</label>
                <input
                  value={form.name} required
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Data de início</label>
                  <input type="date" value={form.startDate} required
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Data de fim</label>
                  <input type="date" value={form.endDate} required
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Participantes estimados</label>
                  <input type="number" min="0" value={form.estimatedParticipants}
                    onChange={(e) => setForm((f) => ({ ...f, estimatedParticipants: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Expositores planejados</label>
                  <input type="number" min="0" value={form.estimatedExhibitors}
                    onChange={(e) => setForm((f) => ({ ...f, estimatedExhibitors: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
                <textarea rows={3} value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading === "edit"}
                  className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors">
                  {loading === "edit" ? "Salvando..." : "Salvar alterações"}
                </button>
                <button type="button" onClick={() => setShowEdit(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗑</span>
              </div>
              <h2 className="text-lg font-bold text-slate-800 text-center mb-1">Excluir evento?</h2>
              <p className="text-sm text-slate-500 text-center mb-5">
                Essa ação é <strong>irreversível</strong>. Todos os estandes, expositores e dados do evento serão excluídos permanentemente.
              </p>
              <p className="text-xs font-medium text-slate-600 mb-2">
                Digite <span className="font-mono bg-slate-100 px-1 rounded">{event.name}</span> para confirmar:
              </p>
              <input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={event.name}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirm !== event.name || loading === "delete"}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold disabled:opacity-40 transition-colors"
                >
                  {loading === "delete" ? "Excluindo..." : "Excluir definitivamente"}
                </button>
                <button
                  onClick={() => { setShowDelete(false); setDeleteConfirm(""); }}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
