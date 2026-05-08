import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const orgId = (session?.user as { organizationId?: string })?.organizationId;
  const firstName = session?.user?.name?.split(" ")[0] || "Usuário";

  const events = await (async () => {
    try {
      if (!orgId) return [];
      return await prisma.event.findMany({
        where: { organizationId: orgId },
        include: { _count: { select: { stands: true, exhibitors: true } }, stands: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      });
    } catch { return []; }
  })();

  const activeEvents = events.filter((e) => e.status !== "encerrado").length;
  const totalStands = events.reduce((s, e) => s + e._count.stands, 0);
  const occupiedStands = events.reduce((s, e) => s + e.stands.filter((st) => st.status === "ocupado").length, 0);
  const occupancyPct = totalStands > 0 ? Math.round((occupiedStands / totalStands) * 100) : 0;
  const totalRevenue = events.reduce((s, e) => s + e.stands.filter((st) => st.status === "ocupado").reduce((r, st) => r + st.basePrice, 0), 0);
  const totalExhibitors = events.reduce((s, e) => s + e._count.exhibitors, 0);

  const statusMap: Record<string, { label: string; dot: string; bg: string }> = {
    rascunho:     { label: "Rascunho",      dot: "bg-gray-400",    bg: "bg-gray-100 text-gray-600" },
    publicado:    { label: "Publicado",      dot: "bg-indigo-500",  bg: "bg-indigo-50 text-indigo-700" },
    em_andamento: { label: "Em andamento",   dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
    encerrado:    { label: "Encerrado",      dot: "bg-gray-300",    bg: "bg-gray-100 text-gray-500" },
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[13px] text-gray-400 font-medium">{greeting},</p>
          <h1 className="text-[22px] font-bold text-[#1a1a2e] tracking-tight mt-0.5">{firstName}</h1>
        </div>
        <Link href="/dashboard/events/new" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[13px] font-semibold transition-colors shadow-sm shadow-indigo-600/20">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Criar evento
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <Stat label="Eventos ativos" value={activeEvents.toString()} accent="indigo" />
        <Stat label="Estandes vendidos" value={`${occupiedStands}/${totalStands}`} sub={`${occupancyPct}% ocupação`} accent="sky" />
        <Stat label="Receita total" value={totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} accent="emerald" />
        <Stat label="Expositores" value={totalExhibitors.toString()} accent="amber" />
      </div>

      {/* Content */}
      {events.length === 0 ? (
        <>
          {/* Empty state hero */}
          <div className="bg-white rounded-xl border border-[#e2e4ea] p-8 mb-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-lg font-bold text-[#1a1a2e] mb-1">Crie seu primeiro evento</h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">Comece configurando os detalhes do evento, monte o mapa de estandes e compartilhe o portal para expositores.</p>
            <Link href="/dashboard/events/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[13px] font-semibold transition-colors shadow-sm shadow-indigo-600/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Criar evento
            </Link>
          </div>

          {/* Onboarding steps */}
          <div className="grid grid-cols-3 gap-3">
            <Step n="1" title="Informações" desc="Nome, datas, tipo e descrição do evento" done={false} />
            <Step n="2" title="Mapa de Estandes" desc="Monte o layout arrastando blocos no editor" done={false} />
            <Step n="3" title="Portal do Expositor" desc="Publique e receba inscrições automaticamente" done={false} />
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-[#e2e4ea] overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-[#e2e4ea] flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-[#1a1a2e]">Eventos recentes</h2>
            <Link href="/dashboard/events" className="text-[12px] text-indigo-600 hover:text-indigo-700 font-semibold">Ver todos →</Link>
          </div>
          <div className="divide-y divide-[#f0f1f5]">
            {events.map((event) => {
              const st = statusMap[event.status] || statusMap.rascunho;
              const rev = event.stands.filter((s) => s.status === "ocupado").reduce((sum, s) => sum + s.basePrice, 0);
              const d = new Date(event.startDate);
              return (
                <Link key={event.id} href={`/dashboard/events/${event.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-[#fafbfd] transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f6fa] border border-[#e2e4ea] flex flex-col items-center justify-center shrink-0">
                    <p className="text-[8px] uppercase font-bold text-gray-400 leading-none">{d.toLocaleDateString("pt-BR", { month: "short" })}</p>
                    <p className="text-[14px] font-bold text-[#1a1a2e] leading-none mt-px">{d.getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1a1a2e] group-hover:text-indigo-700 truncate transition-colors">{event.name}</p>
                    <p className="text-[11px] text-gray-400 mt-px">{event._count.stands} estandes · {event._count.exhibitors} expositores{rev > 0 ? ` · ${rev.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` : ""}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${st.bg} shrink-0`}>{st.label}</span>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Stat Card ──────────────────────────── */
function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  const colors: Record<string, string> = {
    indigo: "border-l-indigo-500", sky: "border-l-sky-500",
    emerald: "border-l-emerald-500", amber: "border-l-amber-500",
  };
  return (
    <div className={`bg-white rounded-xl border border-[#e2e4ea] p-4 border-l-[3px] ${colors[accent]} shadow-sm`}>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-[#1a1a2e] mt-1 tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ── Step Card ──────────────────────────── */
function Step({ n, title, desc, done }: { n: string; title: string; desc: string; done: boolean }) {
  return (
    <div className={`bg-white rounded-xl border border-[#e2e4ea] p-5 shadow-sm ${done ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold ${done ? "bg-emerald-500 text-white" : "bg-indigo-50 text-indigo-600"}`}>
          {done ? "✓" : n}
        </div>
        <h3 className="text-[13px] font-semibold text-[#1a1a2e]">{title}</h3>
      </div>
      <p className="text-[12px] text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
