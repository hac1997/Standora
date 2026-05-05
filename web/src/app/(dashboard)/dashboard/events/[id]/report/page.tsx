import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function EventReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let event: Awaited<ReturnType<typeof prisma.event.findUnique>> & {
    stands: { status: string; basePrice: number }[];
    exhibitors: { id: string }[];
    expenses: { status: string; amount: number }[];
  } | null = null;

  try {
    event = await prisma.event.findUnique({ where: { id }, include: { stands: true, exhibitors: true, expenses: true } }) as typeof event;
  } catch { event = null; }

  if (!event) notFound();

  const totalStands = event.stands.length;
  const occupiedStands = event.stands.filter((s) => s.status === "ocupado").length;
  const reservedStands = event.stands.filter((s) => s.status === "reservado").length;
  const availableStands = event.stands.filter((s) => s.status === "disponivel").length;
  const occupancyPct = totalStands > 0 ? Math.round((occupiedStands / totalStands) * 100) : 0;
  const revenue = event.stands.filter((s) => s.status === "ocupado").reduce((sum, s) => sum + s.basePrice, 0);
  const totalExpenses = event.expenses.filter((e) => e.status === "pago").reduce((sum, e) => sum + e.amount, 0);
  const margin = revenue - totalExpenses;
  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const kpis = [
    { label: "Ocupação", value: `${occupancyPct}%`, sub: `${occupiedStands} de ${totalStands}`, accent: "indigo" },
    { label: "Receita", value: fmt(revenue), sub: "estandes ocupados", accent: "emerald" },
    { label: "Despesas", value: fmt(totalExpenses), sub: "pagas", accent: "red" },
    { label: "Resultado", value: fmt(margin), sub: margin >= 0 ? "superávit" : "déficit", accent: margin >= 0 ? "emerald" : "red" },
    { label: "Expositores", value: event.exhibitors.length.toString(), sub: "cadastrados", accent: "sky" },
    { label: "Ticket Médio", value: occupiedStands > 0 ? fmt(revenue / occupiedStands) : "—", sub: "por estande", accent: "amber" },
  ];

  const accentBorder: Record<string, string> = {
    indigo: "border-l-indigo-500", emerald: "border-l-emerald-500", red: "border-l-red-500",
    sky: "border-l-sky-500", amber: "border-l-amber-500",
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a2e] tracking-tight">Relatório</h1>
          <p className="text-sm text-gray-400 mt-0.5">{event.name}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-[#e2e4ea] text-gray-600 hover:bg-gray-50 rounded-lg text-[13px] font-semibold transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Exportar PDF
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`bg-white rounded-lg border border-[#e2e4ea] p-4 border-l-[3px] shadow-sm ${accentBorder[kpi.accent] || "border-l-gray-300"}`}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{kpi.label}</p>
            <p className="text-xl font-bold text-[#1a1a2e] mt-0.5">{kpi.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      <div className="bg-white rounded-xl border border-[#e2e4ea] p-6 shadow-sm mb-5">
        <h2 className="text-[14px] font-semibold text-[#1a1a2e] mb-4">Distribuição de Estandes</h2>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex mb-4">
          {occupiedStands > 0 && (<div className="h-full bg-red-500 transition-all" style={{ width: `${Math.round((occupiedStands / totalStands) * 100)}%` }} />)}
          {reservedStands > 0 && (<div className="h-full bg-amber-400 transition-all" style={{ width: `${Math.round((reservedStands / totalStands) * 100)}%` }} />)}
          {availableStands > 0 && (<div className="h-full bg-emerald-300 transition-all" style={{ width: `${Math.round((availableStands / totalStands) * 100)}%` }} />)}
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex items-center gap-2 justify-center"><span className="w-3 h-3 rounded-full bg-red-500" /><div><p className="text-[#1a1a2e] font-bold">{occupiedStands}</p><p className="text-xs text-gray-400">Ocupados</p></div></div>
          <div className="flex items-center gap-2 justify-center"><span className="w-3 h-3 rounded-full bg-amber-400" /><div><p className="text-[#1a1a2e] font-bold">{reservedStands}</p><p className="text-xs text-gray-400">Reservados</p></div></div>
          <div className="flex items-center gap-2 justify-center"><span className="w-3 h-3 rounded-full bg-emerald-300" /><div><p className="text-[#1a1a2e] font-bold">{availableStands}</p><p className="text-xs text-gray-400">Disponíveis</p></div></div>
        </div>
      </div>

      {/* Financial summary */}
      <div className="bg-white rounded-xl border border-[#e2e4ea] p-6 shadow-sm">
        <h2 className="text-[14px] font-semibold text-[#1a1a2e] mb-4">Resumo Financeiro</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b border-[#f0f1f5]"><span className="text-gray-500 text-sm">Receita de Estandes</span><span className="text-emerald-600 font-semibold">{fmt(revenue)}</span></div>
          <div className="flex justify-between items-center py-3 border-b border-[#f0f1f5]"><span className="text-gray-500 text-sm">Total de Despesas</span><span className="text-red-600 font-semibold">{fmt(totalExpenses)}</span></div>
          <div className="flex justify-between items-center pt-3"><span className="text-[#1a1a2e] font-semibold">Resultado Líquido</span><span className={`text-xl font-bold ${margin >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(margin)}</span></div>
        </div>
      </div>
    </div>
  );
}
