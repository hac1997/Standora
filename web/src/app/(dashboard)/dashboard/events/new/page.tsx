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

const STEPS = [
  { id: 1, label: "Informações" },
  { id: 2, label: "Datas & Público" },
  { id: 3, label: "Revisão" },
];

export default function NewEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    type: "feira",
    description: "",
    startDate: "",
    endDate: "",
    estimatedParticipants: "",
    estimatedExhibitors: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvance(): boolean {
    if (step === 1) return form.name.trim().length > 0;
    if (step === 2) return form.startDate.length > 0 && form.endDate.length > 0;
    return true;
  }

  function next() {
    if (canAdvance() && step < 3) setStep(step + 1);
  }

  function back() {
    if (step > 1) setStep(step - 1);
  }

  async function handleCreate() {
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

  const typeLabel = EVENT_TYPES.find((t) => t.value === form.type)?.label || form.type;
  const inputCls = "w-full px-3.5 py-2.5 bg-white border border-[#e2e4ea] rounded-lg text-[#1a1a2e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm";
  const labelCls = "block text-[13px] font-medium text-gray-600 mb-1.5";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/events" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-3 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Voltar
        </Link>
        <h1 className="text-[22px] font-bold text-[#1a1a2e] tracking-tight">Criar Novo Evento</h1>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1 flex-1">
            <button
              onClick={() => s.id < step && setStep(s.id)}
              className={`flex items-center gap-2 text-[12px] font-semibold transition-colors ${
                s.id === step ? "text-indigo-600" : s.id < step ? "text-emerald-600 cursor-pointer" : "text-gray-300"
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all ${
                s.id === step
                  ? "border-indigo-500 bg-indigo-500 text-white"
                  : s.id < step
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-gray-200 bg-white text-gray-400"
              }`}>
                {s.id < step ? "✓" : s.id}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-[2px] rounded ${s.id < step ? "bg-emerald-400" : "bg-gray-200"} mx-2`} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-[#e2e4ea] p-7 shadow-sm">
        {/* Step 1: Informações */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[#1a1a2e] mb-1">Informações Básicas</h2>
              <p className="text-sm text-gray-400">Defina o nome e tipo do seu evento.</p>
            </div>
            <div>
              <label className={labelCls}>Nome do Evento *</label>
              <input type="text" placeholder="Ex: Feira de Tecnologia 2026" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} autoFocus />
            </div>
            <div>
              <label className={labelCls}>Tipo de Evento *</label>
              <div className="grid grid-cols-3 gap-2">
                {EVENT_TYPES.map((t) => (
                  <button key={t.value} type="button" onClick={() => set("type", t.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      form.type === t.value ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-[#e2e4ea] bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Descrição</label>
              <textarea rows={3} placeholder="Descreva o evento, programação, público-alvo..." value={form.description} onChange={(e) => set("description", e.target.value)} className={`${inputCls} resize-none`} />
            </div>
          </div>
        )}

        {/* Step 2: Datas & Público */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[#1a1a2e] mb-1">Datas & Público</h2>
              <p className="text-sm text-gray-400">Defina quando o evento acontece e o tamanho esperado.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Data de Início *</label>
                <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Data de Fim *</label>
                <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Participantes estimados</label>
                <input type="number" min="0" placeholder="0" value={form.estimatedParticipants} onChange={(e) => set("estimatedParticipants", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Expositores planejados</label>
                <input type="number" min="0" placeholder="0" value={form.estimatedExhibitors} onChange={(e) => set("estimatedExhibitors", e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Revisão */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[#1a1a2e] mb-1">Revisão</h2>
              <p className="text-sm text-gray-400">Confira os dados antes de criar o evento.</p>
            </div>
            <div className="bg-[#f5f6fa] rounded-lg p-5 space-y-3">
              <ReviewRow label="Nome" value={form.name} />
              <ReviewRow label="Tipo" value={typeLabel} />
              {form.description && <ReviewRow label="Descrição" value={form.description} />}
              <div className="border-t border-[#e2e4ea] pt-3 mt-3" />
              <ReviewRow label="Data de Início" value={form.startDate ? new Date(form.startDate + "T12:00:00").toLocaleDateString("pt-BR") : "—"} />
              <ReviewRow label="Data de Fim" value={form.endDate ? new Date(form.endDate + "T12:00:00").toLocaleDateString("pt-BR") : "—"} />
              <ReviewRow label="Participantes estimados" value={form.estimatedParticipants || "0"} />
              <ReviewRow label="Expositores planejados" value={form.estimatedExhibitors || "0"} />
            </div>
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-7 pt-5 border-t border-[#f0f1f5]">
          {step > 1 ? (
            <button onClick={back} className="flex-1 py-2.5 px-4 border border-[#e2e4ea] rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              ← Voltar
            </button>
          ) : (
            <Link href="/dashboard/events" className="flex-1 text-center py-2.5 px-4 border border-[#e2e4ea] rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </Link>
          )}
          {step < 3 ? (
            <button onClick={next} disabled={!canAdvance()} className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm shadow-sm shadow-indigo-600/20">
              Próximo →
            </button>
          ) : (
            <button onClick={handleCreate} disabled={loading} className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm shadow-sm shadow-indigo-600/20">
              {loading ? "Criando..." : "Criar Evento"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-[12px] font-medium text-gray-400 shrink-0">{label}</span>
      <span className="text-[13px] font-medium text-[#1a1a2e] text-right ml-4 break-words">{value}</span>
    </div>
  );
}
