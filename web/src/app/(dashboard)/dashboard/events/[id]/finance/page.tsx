"use client";

import { useEffect, useState, use } from "react";

interface Expense { id: string; description: string; category: string; amount: number; dueDate: string; status: string; }
interface FinanceData { expenses: Expense[]; revenue: number; totalExpenses: number; margin: number; }

const CATEGORIES = ["locação", "montagem", "marketing", "pessoal", "alimentação", "tecnologia", "outros"];
const EXPENSE_STATUS: Record<string, { label: string; bg: string }> = {
  pago: { label: "Pago", bg: "bg-emerald-50 text-emerald-700" },
  pendente: { label: "Pendente", bg: "bg-amber-50 text-amber-700" },
  atrasado: { label: "Atrasado", bg: "bg-red-50 text-red-700" },
};

const inputCls = "w-full px-3.5 py-2.5 bg-white border border-[#e2e4ea] rounded-lg text-[#1a1a2e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm";

export default function FinancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<FinanceData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: "", category: "outros", amount: "", dueDate: "" });
  const [saving, setSaving] = useState(false);

  async function load() { const res = await fetch(`/api/events/${id}/finance`); setData(await res.json()); }
  useEffect(() => { load(); }, [id]);

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/events/${id}/finance`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ description: "", category: "outros", amount: "", dueDate: "" });
    setSaving(false);
    await load();
  }

  if (!data) return (<div className="flex items-center justify-center h-64"><p className="text-gray-400 text-sm">Carregando financeiro...</p></div>);

  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1a1a2e] tracking-tight">Financeiro</h1>
        <p className="text-sm text-gray-400 mt-0.5">Receitas, despesas e margem do evento.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-[#e2e4ea] p-4 border-l-[3px] border-l-emerald-500 shadow-sm">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Receita</p>
          <p className="text-lg font-bold text-emerald-600 mt-0.5">{fmt(data.revenue)}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#e2e4ea] p-4 border-l-[3px] border-l-red-500 shadow-sm">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Despesas</p>
          <p className="text-lg font-bold text-red-600 mt-0.5">{fmt(data.totalExpenses)}</p>
        </div>
        <div className={`bg-white rounded-lg border border-[#e2e4ea] p-4 border-l-[3px] shadow-sm ${data.margin >= 0 ? "border-l-emerald-500" : "border-l-red-500"}`}>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Resultado</p>
          <p className={`text-lg font-bold mt-0.5 ${data.margin >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(data.margin)}</p>
        </div>
      </div>

      {/* Expenses */}
      <div className="bg-white rounded-xl border border-[#e2e4ea] overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-[#e2e4ea] flex justify-between items-center">
          <h2 className="text-[13px] font-semibold text-[#1a1a2e]">Despesas ({data.expenses.length})</h2>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[12px] font-semibold transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Adicionar
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddExpense} className="px-5 py-4 bg-[#f5f6fa] border-b border-[#e2e4ea]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input placeholder="Descrição" required value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className={`col-span-2 ${inputCls}`} />
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Valor (R$)" required min="0" step="0.01" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} className={inputCls} />
              <input type="date" required value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} className={inputCls} />
              <div className="col-span-2 md:col-span-3 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-[#e2e4ea] rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[12px] font-semibold disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
              </div>
            </div>
          </form>
        )}

        {data.expenses.length === 0 ? (
          <div className="py-14 text-center"><p className="text-gray-400 text-sm">Nenhuma despesa registrada.</p></div>
        ) : (
          <div className="divide-y divide-[#f0f1f5]">
            {data.expenses.map((exp) => {
              const expSt = EXPENSE_STATUS[exp.status] || EXPENSE_STATUS.pendente;
              return (
                <div key={exp.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-[#fafbfd] transition-colors">
                  <div>
                    <p className="font-medium text-[#1a1a2e] text-sm">{exp.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{exp.category} · Vence {new Date(exp.dueDate).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="font-semibold text-[#1a1a2e] text-sm">{fmt(exp.amount)}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${expSt.bg}`}>{expSt.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
