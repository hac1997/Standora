"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface StaffMember { id: string; name: string; role: string; type: string; dailyRate: number; }
interface Shift { id: string; sector: string; startTime: string; endTime: string; status: string; staffMember: StaffMember; }

const SECTORS = ["credenciamento", "segurança", "limpeza", "recepção", "operações", "TI", "alimentação"];
const SECTOR_COLORS: Record<string, string> = {
  credenciamento: "bg-violet-500/20 text-violet-400 border-violet-500/20",
  segurança: "bg-red-500/20 text-red-400 border-red-500/20",
  limpeza: "bg-blue-500/20 text-blue-400 border-blue-500/20",
  recepção: "bg-pink-500/20 text-pink-400 border-pink-500/20",
  operações: "bg-amber-500/20 text-amber-400 border-amber-500/20",
  TI: "bg-cyan-500/20 text-cyan-400 border-cyan-500/20",
  alimentação: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
};
const TYPE_BADGE: Record<string, string> = {
  proprio: "bg-violet-500/10 text-violet-400",
  temporario: "bg-amber-500/10 text-amber-400",
  terceiro: "bg-blue-500/10 text-blue-400",
};
const TYPE_LABEL: Record<string, string> = { proprio: "Próprio", temporario: "Temporário", terceiro: "Terceiro" };

const inputClass = "w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function StaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [shiftForm, setShiftForm] = useState({ staffMemberId: "", sector: "credenciamento", startTime: "", endTime: "" });
  const [memberForm, setMemberForm] = useState({ name: "", email: "", phone: "", role: "operacional", type: "proprio", dailyRate: "" });
  const [saving, setSaving] = useState(false);

  async function loadShifts() {
    const res = await fetch(`/api/events/${id}/staff`);
    const json = await res.json();
    setShifts(json.shifts || []);
  }
  async function loadStaff() {
    const res = await fetch("/api/staff");
    const json = await res.json();
    setAllStaff(json.staff || []);
  }

  useEffect(() => { loadShifts(); loadStaff(); }, [id]);

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(memberForm) });
    setShowMemberForm(false);
    setMemberForm({ name: "", email: "", phone: "", role: "operacional", type: "proprio", dailyRate: "" });
    setSaving(false);
    await loadStaff();
  }

  async function handleAddShift(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/events/${id}/staff`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(shiftForm) });
    setShowShiftForm(false);
    setShiftForm({ staffMemberId: "", sector: "credenciamento", startTime: "", endTime: "" });
    setSaving(false);
    await loadShifts();
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/dashboard/events/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Voltar ao Evento
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Gestão de Equipe</h1>
            <p className="text-slate-500 text-sm mt-1">{allStaff.length} colaboradores · {shifts.length} escalas</p>
          </div>
        </div>
      </div>

      {/* Staff Members */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden mb-5">
        <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center">
          <h2 className="font-semibold text-white">Colaboradores <span className="text-slate-600 font-normal">({allStaff.length})</span></h2>
          <button
            onClick={() => setShowMemberForm(!showMemberForm)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Adicionar Colaborador
          </button>
        </div>

        {showMemberForm && (
          <form onSubmit={handleAddMember} className="px-6 py-5 bg-white/[0.02] border-b border-white/[0.06]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <input placeholder="Nome completo" required value={memberForm.name} onChange={(e) => setMemberForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} />
              <input placeholder="Email" type="email" required value={memberForm.email} onChange={(e) => setMemberForm((p) => ({ ...p, email: e.target.value }))} className={inputClass} />
              <input placeholder="Telefone" value={memberForm.phone} onChange={(e) => setMemberForm((p) => ({ ...p, phone: e.target.value }))} className={inputClass} />
              <select value={memberForm.type} onChange={(e) => setMemberForm((p) => ({ ...p, type: e.target.value }))} className={`${inputClass} bg-[#0a0a0f]`}>
                <option value="proprio">Próprio</option>
                <option value="temporario">Temporário</option>
                <option value="terceiro">Terceirizado</option>
              </select>
              <input type="number" placeholder="Diária (R$)" min="0" value={memberForm.dailyRate} onChange={(e) => setMemberForm((p) => ({ ...p, dailyRate: e.target.value }))} className={inputClass} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowMemberForm(false)} className="flex-1 py-2 border border-white/[0.08] rounded-xl text-xs text-slate-400 hover:text-white transition-all">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50">
                  {saving ? "..." : "Salvar"}
                </button>
              </div>
            </div>
          </form>
        )}

        {allStaff.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-slate-500 text-sm">Nenhum colaborador cadastrado.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {allStaff.map((m) => (
              <div key={m.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 flex items-center justify-center text-sm font-bold text-violet-300 shrink-0">
                  {getInitials(m.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200 text-sm">{m.name}</p>
                  <p className="text-xs text-slate-600 capitalize mt-0.5">{m.role}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[m.type] || TYPE_BADGE.proprio}`}>
                  {TYPE_LABEL[m.type] || m.type}
                </span>
                <p className="text-sm font-semibold text-white shrink-0">
                  {m.dailyRate.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}<span className="text-xs text-slate-600 font-normal">/dia</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shifts */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center">
          <h2 className="font-semibold text-white">Escalas do Evento <span className="text-slate-600 font-normal">({shifts.length})</span></h2>
          <button
            onClick={() => setShowShiftForm(!showShiftForm)}
            disabled={allStaff.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Adicionar Escala
          </button>
        </div>

        {showShiftForm && (
          <form onSubmit={handleAddShift} className="px-6 py-5 bg-white/[0.02] border-b border-white/[0.06]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <select required value={shiftForm.staffMemberId} onChange={(e) => setShiftForm((p) => ({ ...p, staffMemberId: e.target.value }))} className={`col-span-2 ${inputClass} bg-[#0a0a0f]`}>
                <option value="">Selecione o colaborador</option>
                {allStaff.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <select value={shiftForm.sector} onChange={(e) => setShiftForm((p) => ({ ...p, sector: e.target.value }))} className={`${inputClass} bg-[#0a0a0f]`}>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <div />
              <div>
                <label className="block text-xs text-slate-600 mb-1">Início</label>
                <input type="datetime-local" required value={shiftForm.startTime} onChange={(e) => setShiftForm((p) => ({ ...p, startTime: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Fim</label>
                <input type="datetime-local" required value={shiftForm.endTime} onChange={(e) => setShiftForm((p) => ({ ...p, endTime: e.target.value }))} className={inputClass} />
              </div>
              <div className="col-span-2 flex gap-2 justify-end items-end">
                <button type="button" onClick={() => setShowShiftForm(false)} className="px-4 py-2 border border-white/[0.08] rounded-xl text-xs text-slate-400 hover:text-white transition-all">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50">
                  {saving ? "Salvando..." : "Salvar Escala"}
                </button>
              </div>
            </div>
          </form>
        )}

        {shifts.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-slate-500 text-sm">Nenhuma escala criada para este evento.</p>
            {allStaff.length === 0 && <p className="text-slate-600 text-xs mt-1">Adicione colaboradores primeiro.</p>}
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {shifts.map((shift) => {
              const sectorColor = SECTOR_COLORS[shift.sector] || "bg-slate-500/20 text-slate-400 border-slate-500/20";
              return (
                <div key={shift.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 flex items-center justify-center text-xs font-bold text-violet-300 shrink-0">
                    {getInitials(shift.staffMember.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-200 text-sm">{shift.staffMember.name}</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {new Date(shift.startTime).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} – {new Date(shift.endTime).toLocaleString("pt-BR", { timeStyle: "short" })}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${sectorColor}`}>{shift.sector}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">{shift.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
