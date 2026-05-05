import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

const STATUS: Record<string, { label: string; bg: string }> = {
  rascunho:     { label: "Rascunho",     bg: "bg-gray-100 text-gray-600" },
  publicado:    { label: "Publicado",    bg: "bg-indigo-50 text-indigo-700" },
  em_andamento: { label: "Em andamento", bg: "bg-emerald-50 text-emerald-700" },
  encerrado:    { label: "Encerrado",    bg: "bg-gray-100 text-gray-500" },
};

const TYPE_MAP: Record<string, string> = {
  feira: "Feira", exposicao: "Exposição", congresso: "Congresso",
  festival: "Festival", corporativo: "Corporativo", outro: "Outro",
};

export default async function EventInfoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let event: Awaited<ReturnType<typeof prisma.event.findUnique>> & {
    _count: { stands: number; exhibitors: number };
    stands: { status: string; basePrice: number }[];
  } | null = null;

  try {
    event = await prisma.event.findUnique({
      where: { id },
      include: { _count: { select: { stands: true, exhibitors: true } }, stands: true },
    }) as typeof event;
  } catch { event = null; }

  if (!event) notFound();

  const st = STATUS[event.status] || STATUS.rascunho;
  const occupied = event.stands.filter((s) => s.status === "ocupado").length;
  const totalStands = event.stands.length;
  const occupancy = totalStands > 0 ? Math.round((occupied / totalStands) * 100) : 0;
  const revenue = event.stands.filter((s) => s.status === "ocupado").reduce((sum, s) => sum + s.basePrice, 0);

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{TYPE_MAP[event.type] || event.type}</p>
          <h1 className="text-xl font-bold text-[#1a1a2e] tracking-tight mt-0.5">{event.name}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {new Date(event.startDate).toLocaleDateString("pt-BR")} → {new Date(event.endDate).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${st.bg}`}>{st.label}</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Estandes", value: `${occupied}/${totalStands}` },
          { label: "Ocupação", value: `${occupancy}%` },
          { label: "Expositores", value: event._count.exhibitors.toString() },
          { label: "Receita", value: revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg border border-[#e2e4ea] p-3 shadow-sm">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{kpi.label}</p>
            <p className="text-lg font-bold text-[#1a1a2e] mt-0.5">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Event details */}
      <div className="bg-white rounded-xl border border-[#e2e4ea] p-6 shadow-sm">
        <h2 className="text-[14px] font-semibold text-[#1a1a2e] mb-4">Detalhes do Evento</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <Field label="Nome" value={event.name} />
          <Field label="Tipo" value={TYPE_MAP[event.type] || event.type} />
          <Field label="Data de Início" value={new Date(event.startDate).toLocaleDateString("pt-BR")} />
          <Field label="Data de Fim" value={new Date(event.endDate).toLocaleDateString("pt-BR")} />
          <Field label="Participantes estimados" value={event.estimatedParticipants.toString()} />
          <Field label="Expositores planejados" value={event.estimatedExhibitors.toString()} />
          <Field label="Slug (portal)" value={`/portal/${event.slug}`} mono />
        </div>
        {event.description && (
          <div className="mt-5 pt-4 border-t border-[#f0f1f5]">
            <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Descrição</p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-400 mb-0.5">{label}</p>
      <p className={`text-[14px] font-medium text-[#1a1a2e] ${mono ? "font-mono text-[13px] text-indigo-600" : ""}`}>{value}</p>
    </div>
  );
}
