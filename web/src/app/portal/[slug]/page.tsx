"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const MapEditor = dynamic(() => import("@/components/map/MapEditor"), { ssr: false });

interface Stand {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  colorHex: string;
  basePrice: number;
  status: "disponivel" | "reservado" | "ocupado";
}

interface EventData {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  description: string | null;
  estimatedParticipants: number;
}

const inputClass = "w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm";
const labelClass = "block text-xs font-medium text-slate-400 mb-1.5";

export default function PortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("");
  const [event, setEvent] = useState<EventData | null>(null);
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const [step, setStep] = useState<"map" | "form" | "success">("map");
  const [form, setForm] = useState({ companyName: "", cnpj: "", contactName: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ slug: s }) => {
      setSlug(s);
      fetch(`/api/portal/${s}`)
        .then((r) => r.json())
        .then((data) => { if (data.event) setEvent(data.event); });
    });
  }, [params]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/portal/${slug}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, standId: selectedStand?.id }),
    });
    if (res.ok) {
      setStep("success");
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao registrar.");
    }
    setLoading(false);
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Carregando evento...
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-8">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 max-w-lg text-center shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Cadastro enviado!</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Sua solicitação para o estande <strong className="text-white">{selectedStand?.name}</strong> foi recebida com sucesso. O organizador entrará em contato para confirmar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="bg-white/[0.02] border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">Portal do Expositor · Standora</p>
          <h1 className="text-base font-bold text-white mt-0.5">{event.name}</h1>
        </div>
        <p className="text-sm text-slate-500">
          {new Date(event.startDate).toLocaleDateString("pt-BR")} → {new Date(event.endDate).toLocaleDateString("pt-BR")}
        </p>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {step === "map" && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Selecione um estande disponível</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Clique em um estande <span className="text-emerald-400 font-medium">verde</span> para reservá-lo.
                </p>
              </div>
              <div className="flex items-center gap-5 text-sm text-slate-400">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500" />Disponível</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-400" />Reservado</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-slate-600" />Ocupado</span>
              </div>
            </div>

            {selectedStand && (
              <div className="mb-4 bg-violet-500/10 border border-violet-500/20 rounded-2xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-violet-200">
                    Estande selecionado: <strong className="text-white">{selectedStand.name}</strong>
                  </p>
                  <p className="text-sm text-violet-300/60">
                    {selectedStand.width / 20}m × {selectedStand.height / 20}m · {selectedStand.basePrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
                <button
                  onClick={() => setStep("form")}
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-500/20"
                >
                  Prosseguir →
                </button>
              </div>
            )}

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden" style={{ height: 560 }}>
              <MapEditor
                eventId={event.id}
                readonly
                onStandSelect={(stand) => {
                  if (stand.status === "disponivel") setSelectedStand(stand);
                }}
              />
            </div>
          </>
        )}

        {step === "form" && (
          <div className="max-w-xl mx-auto">
            <button
              onClick={() => setStep("map")}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-6 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Voltar ao mapa
            </button>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-1">Dados do Expositor</h2>
              <p className="text-slate-500 text-sm mb-7">
                Estande: <strong className="text-slate-300">{selectedStand?.name}</strong> · {selectedStand?.basePrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className={labelClass}>Nome da Empresa *</label>
                  <input required value={form.companyName} onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))} placeholder="Minha Empresa Ltda." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>CNPJ</label>
                  <input value={form.cnpj} onChange={(e) => setForm((p) => ({ ...p, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Nome do Responsável *</label>
                  <input required value={form.contactName} onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))} placeholder="João Silva" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="contato@empresa.com" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Telefone</label>
                    <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="(11) 99999-9999" className={inputClass} />
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50 text-sm shadow-lg shadow-violet-500/20"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enviando...
                    </span>
                  ) : "Confirmar Solicitação de Estande"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
