"use client";

import { useEffect, useState, use } from "react";

interface StaffMember { id: string; name: string; role: string; type: string; dailyRate: number; }
interface Shift { id: string; sector: string; startTime: string; endTime: string; status: string; staffMember: StaffMember; }

const SECTORS = ["credenciamento", "segurança", "limpeza", "recepção", "operações", "TI", "alimentação"];
const SECTOR_COLORS: Record<string, string> = {
  credenciamento: "bg-indigo-50 text-indigo-700", segurança: "bg-red-50 text-red-700",
  limpeza: "bg-sky-50 text-sky-700", recepção: "bg-pink-50 text-pink-700",
  operações: "bg-amber-50 text-amber-700", TI: "bg-cyan-50 text-cyan-700",
  alimentação: "bg-emerald-50 text-emerald-700",
};
const TYPE_BADGE: Record<string, string> = { proprio: "bg-indigo-50 text-indigo-700", temporario: "bg-amber-50 text-amber-700", terceiro: "bg-sky-50 text-sky-700" };
const TYPE_LABEL: Record<string, string> = { proprio: "Próprio", temporario: "Temporário", terceiro: "Terceiro" };

const inputCls = "w-full px-3.5 py-2.5 bg-white border border-[#e2e4ea] rounded-lg text-[#1a1a2e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm";

function getInitials(name: string) { return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(); }

export default function StaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [shiftForm, setShiftForm] = useState({ staffMemberId: "", sector: "credenciamento", startTime: "", endTime: "" });
  const [memberForm, setMemberForm] = useState({ name: "", email: "", phone: "", role: "operacional", type: "proprio", dailyRate: "" });
  const [saving, setSaving] = useState(false);

  async function loadShifts() { const res = await fetch(`/api/events/${id}/staff`); const j = await res.json(); setShifts(j.shifts || []); }
  async function loadStaff() { const res = await fetch("/api/staff"); const j = await res.json(); setAllStaff(j.staff || []); }
  useEffect(() => { loadShifts(); loadStaff(); }, [id]);

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await fetch("/api/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(memberForm) });
    setShowMemberForm(false); setMemberForm({ name: "", email: "", phone: "", role: "operacional", type: "proprio", dailyRate: "" }); setSaving(false); await loadStaff();
  }
  async function handleAddShift(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await fetch(`/api/events/${id}/staff`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(shiftForm) });
    setShowShiftForm(false); setShiftForm({ staffMemberId: "", sector: "credenciamento", startTime: "", endTime: "" }); setSaving(false); await loadShifts();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1a1a2e] tracking-tight">Equipe</h1>
        <p className="text-sm text-gray-400 mt-0.5">{allStaff.length} colaboradores · {shifts.length} escalas</p>
      </div>

      {/* Staff Members */}
      <div className="bg-white rounded-xl border border-[#e2e4ea] overflow-hidden shadow-sm mb-5">
        <div className="px-5 py-3.5 border-b border-[#e2e4ea] flex justify-between items-center">
          <h2 className="text-[13px] font-semibold text-[#1a1a2e]">Colaboradores ({allStaff.length})</h2>
          <button onClick={() => setShowMemberForm(!showMemberForm)} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[12px] font-semibold transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Adicionar
          </button>
        </div>
        {showMemberForm && (
          <form onSubmit={handleAddMember} className="px-5 py-4 bg-[#f5f6fa] border-b border-[#e2e4ea]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <input placeholder="Nome completo" required value={memberForm.name} onChange={(e) => setMemberForm((p) => ({ ...p, name: e.target.value }))} className={inputCls} />
              <input placeholder="Email" type="email" required value={memberForm.email} onChange={(e) => setMemberForm((p) => ({ ...p, email: e.target.value }))} className={inputCls} />
              <input placeholder="Telefone" value={memberForm.phone} onChange={(e) => setMemberForm((p) => ({ ...p, phone: e.target.value }))} className={inputCls} />
              <select value={memberForm.type} onChange={(e) => setMemberForm((p) => ({ ...p, type: e.target.value }))} className={inputCls}>
                <option value="proprio">Próprio</option><option value="temporario">Temporário</option><option value="terceiro">Terceirizado</option>
              </select>
              <input type="number" placeholder="Diária (R$)" min="0" value={memberForm.dailyRate} onChange={(e) => setMemberForm((p) => ({ ...p, dailyRate: e.target.value }))} className={inputCls} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowMemberForm(false)} className="flex-1 py-2 border border-[#e2e4ea] rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-[12px] font-semibold disabled:opacity-50">{saving ? "..." : "Salvar"}</button>
              </div>
            </div>
          </form>
        )}
        {allStaff.length === 0 ? (
          <div className="py-14 text-center"><p className="text-gray-400 text-sm">Nenhum colaborador cadastrado.</p></div>
        ) : (
          <div className="divide-y divide-[#f0f1f5]">
            {allStaff.map((m) => (
              <div key={m.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-[#fafbfd] transition-colors">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">{getInitials(m.name)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1a1a2e] text-sm">{m.name}</p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">{m.role}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${TYPE_BADGE[m.type] || TYPE_BADGE.proprio}`}>{TYPE_LABEL[m.type] || m.type}</span>
                <p className="text-sm font-semibold text-[#1a1a2e] shrink-0">{m.dailyRate.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}<span className="text-xs text-gray-400 font-normal">/dia</span></p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shifts */}
      <div className="bg-white rounded-xl border border-[#e2e4ea] overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-[#e2e4ea] flex justify-between items-center">
          <h2 className="text-[13px] font-semibold text-[#1a1a2e]">Escalas ({shifts.length})</h2>
          <button onClick={() => setShowShiftForm(!showShiftForm)} disabled={allStaff.length === 0} className="flex items-center gap-1.5 px-3 py-2 border border-[#e2e4ea] text-gray-600 hover:bg-gray-50 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-40">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Adicionar
          </button>
        </div>
        {showShiftForm && (
          <form onSubmit={handleAddShift} className="px-5 py-4 bg-[#f5f6fa] border-b border-[#e2e4ea]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <select required value={shiftForm.staffMemberId} onChange={(e) => setShiftForm((p) => ({ ...p, staffMemberId: e.target.value }))} className={`col-span-2 ${inputCls}`}>
                <option value="">Selecione o colaborador</option>
                {allStaff.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <select value={shiftForm.sector} onChange={(e) => setShiftForm((p) => ({ ...p, sector: e.target.value }))} className={inputCls}>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <div />
              <div><label className="block text-xs text-gray-400 mb-1">Início</label><input type="datetime-local" required value={shiftForm.startTime} onChange={(e) => setShiftForm((p) => ({ ...p, startTime: e.target.value }))} className={inputCls} /></div>
              <div><label className="block text-xs text-gray-400 mb-1">Fim</label><input type="datetime-local" required value={shiftForm.endTime} onChange={(e) => setShiftForm((p) => ({ ...p, endTime: e.target.value }))} className={inputCls} /></div>
              <div className="col-span-2 flex gap-2 justify-end items-end">
                <button type="button" onClick={() => setShowShiftForm(false)} className="px-4 py-2 border border-[#e2e4ea] rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[12px] font-semibold disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
              </div>
            </div>
          </form>
        )}
        {shifts.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-gray-400 text-sm">Nenhuma escala criada.</p>
            {allStaff.length === 0 && <p className="text-gray-300 text-xs mt-1">Adicione colaboradores primeiro.</p>}
          </div>
        ) : (
          <div className="divide-y divide-[#f0f1f5]">
            {shifts.map((shift) => {
              const sc = SECTOR_COLORS[shift.sector] || "bg-gray-100 text-gray-600";
              return (
                <div key={shift.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-[#fafbfd] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">{getInitials(shift.staffMember.name)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1a1a2e] text-sm">{shift.staffMember.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(shift.startTime).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} – {new Date(shift.endTime).toLocaleString("pt-BR", { timeStyle: "short" })}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md capitalize ${sc}`}>{shift.sector}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 capitalize">{shift.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
