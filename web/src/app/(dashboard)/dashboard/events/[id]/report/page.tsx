import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EventReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let event: Awaited<ReturnType<typeof prisma.event.findUnique>> & {
    stands: { status: string; basePrice: number }[];
    exhibitors: { id: string }[];
    expenses: { status: string; amount: number }[];
  } | null = null;

  try {
    event = await prisma.event.findUnique({
      where: { id },
      include: { stands: true, exhibitors: true, expenses: true },
    }) as typeof event;
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
    { label: "Taxa de Ocupação", value: `${occupancyPct}%`, sub: `${occupiedStands} de ${totalStands} estandes`, color: "text-violet-400", bg: "from-violet-500/20" },
    { label: "Receita Total", value: fmt(revenue), sub: "estandes ocupados", color: "text-emerald-400", bg: "from-emerald-500/20" },
    { label: "Total Despesas", value: fmt(totalExpenses), sub: "despesas pagas", color: "text-red-400", bg: "from-red-500/20" },
    { label: "Resultado Líquido", value: fmt(margin), sub: margin >= 0 ? "superávit" : "déficit", color: margin >= 0 ? "text-emerald-400" : "text-red-400", bg: margin >= 0 ? "from-emerald-500/20" : "from-red-500/20" },
    { label: "Expositores", value: event.exhibitors.length, sub: "cadastrados", color: "text-blue-400", bg: "from-blue-500/20" },
    { label: "Receita/Estande", value: occupiedStands > 0 ? fmt(revenue / occupiedStands) : "—", sub: "ticket médio", color: "text-amber-400", bg: "from-amber-500/20" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/events/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Voltar ao Evento
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Relatório de Performance</h1>
            <p className="text-slate-500 text-sm mt-1">{event.name}</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl text-sm font-semibold transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bg} to-transparent opacity-30 pointer-events-none`} />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-1">{kpi.label}</p>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-slate-600 mt-0.5">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Occupancy visual */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-5">
        <h2 className="font-semibold text-white mb-5">Distribuição de Estandes</h2>
        <div className="h-6 bg-white/[0.04] rounded-full overflow-hidden flex mb-4">
          {occupiedStands > 0 && (
            <div className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all" style={{ width: `${Math.round((occupiedStands / totalStands) * 100)}%` }} />
          )}
          {reservedStands > 0 && (
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all" style={{ width: `${Math.round((reservedStands / totalStands) * 100)}%` }} />
          )}
          {availableStands > 0 && (
            <div className="h-full bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 transition-all" style={{ width: `${Math.round((availableStands / totalStands) * 100)}%` }} />
          )}
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex items-center gap-2 justify-center">
            <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
            <div>
              <p className="text-white font-bold">{occupiedStands}</p>
              <p className="text-xs text-slate-500">Ocupados</p>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <div>
              <p className="text-white font-bold">{reservedStands}</p>
              <p className="text-xs text-slate-500">Reservados</p>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500/60 shrink-0" />
            <div>
              <p className="text-white font-bold">{availableStands}</p>
              <p className="text-xs text-slate-500">Disponíveis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-5">Resumo Financeiro</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b border-white/[0.04]">
            <span className="text-slate-400 text-sm">Receita de Estandes</span>
            <span className="text-emerald-400 font-semibold">{fmt(revenue)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/[0.04]">
            <span className="text-slate-400 text-sm">Total de Despesas</span>
            <span className="text-red-400 font-semibold">{fmt(totalExpenses)}</span>
          </div>
          <div className="flex justify-between items-center pt-3">
            <span className="text-white font-semibold">Resultado Líquido</span>
            <span className={`text-xl font-bold ${margin >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(margin)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
