import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

const STATUS: Record<string, { label: string; bg: string; dot: string }> = {
  rascunho:     { label: "Rascunho",    bg: "bg-gray-100 text-gray-600",      dot: "bg-gray-400" },
  publicado:    { label: "Publicado",   bg: "bg-indigo-50 text-indigo-700",   dot: "bg-indigo-500" },
  em_andamento: { label: "Em andamento", bg: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  encerrado:    { label: "Encerrado",   bg: "bg-gray-50 text-gray-500",       dot: "bg-gray-300" },
};

const TYPE_LABEL: Record<string, string> = {
  feira: "Feira", exposicao: "Exposição", congresso: "Congresso",
  festival: "Festival", corporativo: "Corporativo", outro: "Outro",
};

export default async function EventsPage() {
  const session = await auth();
  const orgId = (session?.user as { organizationId?: string })?.organizationId;

  const events = await (async () => {
    try {
      if (!orgId) return [];
      return await prisma.event.findMany({
        where: { organizationId: orgId },
        include: { _count: { select: { stands: true, exhibitors: true } }, stands: true },
        orderBy: { createdAt: "desc" },
      });
    } catch { return []; }
  })();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Eventos</h1>
          <p className="text-gray-400 text-sm mt-0.5">{events.length} evento{events.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Novo Evento
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <p className="text-gray-800 font-semibold mb-1">Nenhum evento ainda</p>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Crie seu primeiro evento para começar a gerenciar expositores e estandes.</p>
          <Link
            href="/dashboard/events/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Criar primeiro evento
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => {
            const st = STATUS[event.status] || STATUS.rascunho;
            const occupiedStands = event.stands.filter((s) => s.status === "ocupado").length;
            const totalStands = event._count.stands;
            const occupancyPct = totalStands > 0 ? Math.round((occupiedStands / totalStands) * 100) : 0;
            const revenue = event.stands.filter((s) => s.status === "ocupado").reduce((sum, s) => sum + s.basePrice, 0);

            return (
              <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                {/* Top */}
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{TYPE_LABEL[event.type] || event.type}</p>
                    <h2 className="font-semibold text-gray-900 text-sm leading-snug truncate">{event.name}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(event.startDate).toLocaleDateString("pt-BR")} → {new Date(event.endDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md shrink-0 ${st.bg}`}>{st.label}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-bold text-gray-800">{totalStands}</p>
                    <p className="text-[10px] text-gray-400">Estandes</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-bold text-gray-800">{event._count.exhibitors}</p>
                    <p className="text-[10px] text-gray-400">Expositores</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-bold text-emerald-600">{revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                    <p className="text-[10px] text-gray-400">Receita</p>
                  </div>
                </div>

                {/* Occupancy */}
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>Ocupação</span>
                    <span className="font-medium text-gray-600">{occupancyPct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${occupancyPct}%` }} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/dashboard/events/${event.id}`} className="flex-1 text-center px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    Detalhes
                  </Link>
                  <Link href={`/dashboard/events/${event.id}/map`} className="flex-1 text-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors">
                    Editor de Mapa
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
