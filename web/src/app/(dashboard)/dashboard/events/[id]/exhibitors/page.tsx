import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

const EXHIBITOR_STATUS: Record<string, { label: string; bg: string }> = {
  pendente: { label: "Pendente", bg: "bg-amber-50 text-amber-700" },
  aprovado: { label: "Aprovado", bg: "bg-emerald-50 text-emerald-700" },
  reprovado: { label: "Reprovado", bg: "bg-red-50 text-red-700" },
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
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a2e] tracking-tight">Expositores</h1>
          <p className="text-sm text-gray-400 mt-0.5">{aprovado} aprovados · {pendente} pendentes</p>
        </div>
        <a href={`/portal/${event.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[13px] font-semibold transition-colors shadow-sm shadow-indigo-600/20">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          Link do Portal
        </a>
      </div>

      {exhibitors.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e2e4ea] py-16 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <p className="font-semibold text-[#1a1a2e] text-lg mb-1">Nenhum expositor ainda</p>
          <p className="text-gray-400 text-sm mb-5">Compartilhe o link do portal para receber inscrições.</p>
          <a href={`/portal/${event.slug}`} target="_blank" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors">Abrir Portal</a>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#e2e4ea] overflow-hidden shadow-sm">
          <div className="divide-y divide-[#f0f1f5]">
            {exhibitors.map((ex) => {
              const exSt = EXHIBITOR_STATUS[ex.status] || EXHIBITOR_STATUS.pendente;
              return (
                <div key={ex.id} className="px-5 py-4 flex items-center gap-4 hover:bg-[#fafbfd] transition-colors">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">{getInitials(ex.companyName)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1a1a2e] text-sm">{ex.companyName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{ex.contactName} · {ex.email}{ex.cnpj && ` · CNPJ: ${ex.cnpj}`}</p>
                  </div>
                  {ex.stands.length > 0 && (
                    <div className="hidden md:flex flex-wrap gap-1">
                      {ex.stands.map((s) => (<span key={s.name} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">{s.name}</span>))}
                    </div>
                  )}
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${exSt.bg}`}>{exSt.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
