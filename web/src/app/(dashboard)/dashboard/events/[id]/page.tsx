import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

const STATUS: Record<string, { label: string; bg: string }> = {
  rascunho:     { label: "Rascunho",    bg: "bg-gray-100 text-gray-600" },
  publicado:    { label: "Publicado",   bg: "bg-indigo-50 text-indigo-700" },
  em_andamento: { label: "Em andamento", bg: "bg-emerald-50 text-emerald-700" },
  encerrado:    { label: "Encerrado",   bg: "bg-gray-50 text-gray-500" },
};

const EX_STATUS: Record<string, { label: string; bg: string }> = {
  pendente:  { label: "Pendente",  bg: "bg-amber-50 text-amber-700" },
  aprovado:  { label: "Aprovado",  bg: "bg-emerald-50 text-emerald-700" },
  reprovado: { label: "Reprovado", bg: "bg-red-50 text-red-700" },
};

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let event: Awaited<ReturnType<typeof prisma.event.findUnique>> & {
    exhibitors: { id: string; companyName: string; contactName: string; email: string; status: string }[];
    stands: { status: string; basePrice: number }[];
    expenses: { status: string; amount: number }[];
  } | null = null;

  try {
    event = await prisma.event.findUnique({
      where: { id },
      include: { exhibitors: { orderBy: { createdAt: "desc" } }, stands: { include: { exhibitor: true } }, expenses: { orderBy: { dueDate: "asc" }, take: 5 } },
    }) as typeof event;
  } catch { event = null; }

  if (!event) notFound();

  const st = STATUS[event.status] || STATUS.rascunho;
  const occupiedStands = event.stands.filter((s) => s.status === "ocupado").length;
  const totalStands = event.stands.length;
  const occupancyPct = totalStands > 0 ? Math.round((occupiedStands / totalStands) * 100) : 0;
  const revenue = event.stands.filter((s) => s.status === "ocupado").reduce((sum, s) => sum + s.basePrice, 0);
  const paidExpenses = event.expenses.filter((e) => e.status === "pago").reduce((sum, e) => sum + e.amount, 0);
  const margin = revenue - paidExpenses;

  const actions = [
    { href: `/dashboard/events/${id}/map`, label: "Editor de Mapa", primary: true },
    { href: `/dashboard/events/${id}/finance`, label: "Financeiro" },
    { href: `/dashboard/events/${id}/exhibitors`, label: "Expositores" },
    { href: `/dashboard/events/${id}/staff`, label: "Equipe" },
    { href: `/dashboard/events/${id}/report`, label: "Relatório" },
    { href: `/portal/${event.slug}`, label: "Portal", external: true },
  ];

  return (
    <div>
      {/* Back + Header */}
      <div className="mb-6">
        <Link href="/dashboard/events" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-3 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Eventos
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">{event.name}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{new Date(event.startDate).toLocaleDateString("pt-BR")} → {new Date(event.endDate).toLocaleDateString("pt-BR")}</p>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${st.bg}`}>{st.label}</span>
        </div>
        {/* Occupancy */}
        <div className="mt-4 max-w-md">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Ocupação</span><span className="text-gray-600 font-medium">{occupancyPct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${occupancyPct}%` }} />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Estandes", value: `${occupiedStands}/${totalStands}`, sub: "ocupados" },
          { label: "Expositores", value: event.exhibitors.length, sub: "cadastrados" },
          { label: "Receita", value: revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), sub: "confirmada", color: "text-emerald-600" },
          { label: "Resultado", value: margin.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), sub: margin >= 0 ? "superávit" : "déficit", color: margin >= 0 ? "text-emerald-600" : "text-red-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{kpi.label}</p>
            <p className={`text-xl font-bold ${kpi.color || "text-gray-900"}`}>{kpi.value}</p>
            <p className="text-[11px] text-gray-400">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        {actions.map((a) => (
          <Link
            key={a.href} href={a.href}
            target={a.external ? "_blank" : undefined}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              a.primary ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >{a.label}</Link>
        ))}
      </div>

      {/* Exhibitors */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-900">Expositores <span className="text-gray-400 font-normal">({event.exhibitors.length})</span></h2>
          <a href={`/portal/${event.slug}`} target="_blank" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">Compartilhar portal →</a>
        </div>
        {event.exhibitors.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-gray-400 text-sm">Nenhum expositor cadastrado ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {event.exhibitors.map((ex) => {
              const exSt = EX_STATUS[ex.status] || EX_STATUS.pendente;
              return (
                <div key={ex.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{ex.companyName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{ex.contactName} · {ex.email}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${exSt.bg}`}>{exSt.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
