import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

const EXHIBITOR_STATUS: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  aprovado: { label: "Aprovado", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  reprovado: { label: "Reprovado", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default async function ExhibitorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let event: { name: string; slug: string } | null = null;
  let exhibitors: {
    id: string; companyName: string; cnpj: string | null; contactName: string;
    email: string; phone: string | null; status: string;
    stands: { name: string }[];
  }[] = [];

  try {
    event = await prisma.event.findUnique({ where: { id }, select: { name: true, slug: true } });
    exhibitors = await prisma.exhibitor.findMany({
      where: { eventId: id },
      include: { stands: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch { event = null; }

  if (!event) notFound();

  const pendente = exhibitors.filter((e) => e.status === "pendente").length;
  const aprovado = exhibitors.filter((e) => e.status === "aprovado").length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/dashboard/events/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          {event.name}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Expositores</h1>
            <p className="text-slate-500 text-sm mt-1">{aprovado} aprovados · {pendente} pendentes</p>
          </div>
          <div className="flex gap-2">
            <a
              href={`/portal/${event.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl text-xs font-semibold transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              Link do Portal
            </a>
          </div>
        </div>
      </div>

      {exhibitors.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <p className="text-white font-semibold text-lg mb-2">Nenhum expositor ainda</p>
          <p className="text-slate-500 text-sm mb-6">Compartilhe o link do portal para receber inscrições.</p>
          <a href={`/portal/${event.slug}`} target="_blank" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl text-sm font-semibold">
            Abrir Portal do Expositor
          </a>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {exhibitors.map((ex) => {
              const exSt = EXHIBITOR_STATUS[ex.status] || EXHIBITOR_STATUS.pendente;
              return (
                <div key={ex.id} className="px-6 py-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center text-sm font-bold text-violet-300 shrink-0">
                    {getInitials(ex.companyName)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-200 text-sm">{ex.companyName}</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {ex.contactName} · {ex.email}
                      {ex.cnpj && ` · CNPJ: ${ex.cnpj}`}
                    </p>
                  </div>

                  {/* Stand */}
                  {ex.stands.length > 0 && (
                    <div className="hidden md:flex flex-wrap gap-1">
                      {ex.stands.map((s) => (
                        <span key={s.name} className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400">{s.name}</span>
                      ))}
                    </div>
                  )}

                  {/* Status */}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${exSt.color}`}>{exSt.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
