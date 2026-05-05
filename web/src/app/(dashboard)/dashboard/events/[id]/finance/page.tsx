"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  dueDate: string;
  status: string;
}

interface FinanceData {
  expenses: Expense[];
  revenue: number;
  totalExpenses: number;
  margin: number;
}

const CATEGORIES = ["locação", "montagem", "marketing", "pessoal", "alimentação", "tecnologia", "outros"];

const EXPENSE_STATUS: Record<string, { label: string; color: string }> = {
  pago: { label: "Pago", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  pendente: { label: "Pendente", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  atrasado: { label: "Atrasado", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const inputClass = "w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm";

export default function FinancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<FinanceData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: "", category: "outros", amount: "", dueDate: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/events/${id}/finance`);
    const json = await res.json();
    setData(json);
  }

  useEffect(() => { load(); }, [id]);

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/events/${id}/finance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ description: "", category: "outros", amount: "", dueDate: "" });
    setSaving(false);
    await load();
  }

  if (!data) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-slate-500">
        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Carregando financeiro...
      </div>
    </div>
  );

  const kpis = [
    { label: "Receita (Estandes)", value: data.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-500/5" },
    { label: "Despesas Pagas", value: data.totalExpenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), color: "text-red-400", bg: "from-red-500/20 to-red-500/5" },
    { label: "Resultado Líquido", value: data.margin.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), color: data.margin >= 0 ? "text-emerald-400" : "text-red-400", bg: data.margin >= 0 ? "from-emerald-500/20 to-emerald-500/5" : "from-red-500/20 to-red-500/5" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/dashboard/events/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Voltar ao Evento
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">Gestão Financeira</h1>
        <p className="text-slate-500 text-sm mt-1">Controle de receitas, despesas e margem do evento.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bg} opacity-30 pointer-events-none`} />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-2">{kpi.label}</p>
              <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Expenses */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center">
          <h2 className="font-semibold text-white">Despesas <span className="text-slate-600 font-normal">({data.expenses.length})</span></h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Adicionar Despesa
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddExpense} className="px-6 py-5 bg-white/[0.02] border-b border-white/[0.06]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input
                placeholder="Descrição"
                required
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className={`col-span-2 ${inputClass}`}
              />
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className={`${inputClass} bg-[#0a0a0f]`}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                type="number"
                placeholder="Valor (R$)"
                required
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                className={inputClass}
              />
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                className={inputClass}
              />
              <div className="col-span-2 md:col-span-4 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-white/[0.08] rounded-xl text-xs text-slate-400 hover:text-white transition-all">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50">
                  {saving ? "Salvando..." : "Salvar Despesa"}
                </button>
              </div>
            </div>
          </form>
        )}

        {data.expenses.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-500 text-sm">Nenhuma despesa registrada ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {data.expenses.map((exp) => {
              const expSt = EXPENSE_STATUS[exp.status] || EXPENSE_STATUS.pendente;
              return (
                <div key={exp.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div>
                    <p className="font-medium text-slate-200 text-sm">{exp.description}</p>
                    <p className="text-xs text-slate-600 mt-0.5 capitalize">{exp.category} · Vence {new Date(exp.dueDate).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white text-sm">{exp.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${expSt.color}`}>{expSt.label}</span>
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
