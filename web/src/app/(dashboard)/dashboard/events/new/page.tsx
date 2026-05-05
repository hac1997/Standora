"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const EVENT_TYPES = [
  { value: "feira", label: "Feira", icon: "🏪" },
  { value: "exposicao", label: "Exposição", icon: "🎨" },
  { value: "congresso", label: "Congresso", icon: "🎤" },
  { value: "festival", label: "Festival", icon: "🎵" },
  { value: "corporativo", label: "Corporativo", icon: "💼" },
  { value: "outro", label: "Outro", icon: "📌" },
];

const inputClass = "w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", type: "feira", startDate: "", endDate: "",
    description: "", estimatedParticipants: "", estimatedExhibitors: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao criar evento.");
      setLoading(false);
    } else {
      router.push(`/dashboard/events/${data.event.id}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/events" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-3 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Voltar
        </Link>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Criar Novo Evento</h1>
        <p className="text-gray-400 text-sm mt-0.5">Preencha as informações do seu evento.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-7">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Nome do Evento *</label>
            <input name="name" type="text" required placeholder="Ex: Feira de Tecnologia 2026" value={form.name} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Tipo de Evento *</label>
            <div className="grid grid-cols-3 gap-2">
              {EVENT_TYPES.map((t) => (
                <button
                  key={t.value} type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: t.value }))}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    form.type === t.value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Data de Início *</label>
              <input name="startDate" type="date" required value={form.startDate} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Data de Fim *</label>
              <input name="endDate" type="date" required value={form.endDate} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Participantes estimados</label>
              <input name="estimatedParticipants" type="number" min="0" placeholder="0" value={form.estimatedParticipants} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Expositores planejados</label>
              <input name="estimatedExhibitors" type="number" min="0" placeholder="0" value={form.estimatedExhibitors} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Descrição</label>
            <textarea name="description" rows={4} placeholder="Descreva o evento, programação, público-alvo..." value={form.description} onChange={handleChange} className={`${inputClass} resize-none`} />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Link href="/dashboard/events" className="flex-1 text-center px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </Link>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm">
              {loading ? "Criando..." : "Criar Evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
