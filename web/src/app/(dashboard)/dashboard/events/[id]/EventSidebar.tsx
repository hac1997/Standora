"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  rascunho:     { label: "Rascunho",      color: "bg-gray-400" },
  publicado:    { label: "Publicado",      color: "bg-indigo-400" },
  em_andamento: { label: "Em andamento",   color: "bg-emerald-400" },
  encerrado:    { label: "Encerrado",      color: "bg-gray-500" },
};

const TYPE_MAP: Record<string, string> = {
  feira: "Feira", exposicao: "Exposição", congresso: "Congresso",
  festival: "Festival", corporativo: "Corporativo", outro: "Outro",
};

interface EventSidebarProps {
  event: { id: string; name: string; slug: string; status: string; type: string };
}

export function EventSidebar({ event }: EventSidebarProps) {
  const pathname = usePathname();
  const base = `/dashboard/events/${event.id}`;
  const st = STATUS_MAP[event.status] || STATUS_MAP.rascunho;

  const phases = [
    { href: base, label: "Informações", exact: true },
    { href: `${base}/map`, label: "Local & Mapa" },
    { href: `${base}/pricing`, label: "Comercial" },
    { href: `${base}/exhibitors`, label: "Expositores" },
    { href: `${base}/finance`, label: "Financeiro" },
    { href: `${base}/staff`, label: "Equipe" },
    { href: `${base}/report`, label: "Relatórios" },
  ];

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className="w-[240px] bg-[#1a1a2e] flex flex-col h-full">
      {/* Logo + Back */}
      <div className="flex items-center gap-2.5 px-5 h-[56px]">
        <Link href="/dashboard/events" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <span className="text-white font-bold text-[15px] tracking-tight">Standora</span>
        </Link>
      </div>

      {/* Event info */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-0.5">{TYPE_MAP[event.type] || event.type}</p>
        <h2 className="text-[14px] font-bold text-white leading-snug truncate">{event.name}</h2>
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`w-2 h-2 rounded-full ${st.color}`} />
          <span className="text-[11px] font-medium text-white/40">{st.label}</span>
        </div>
      </div>

      {/* Lifecycle phases */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <p className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.12em] px-3 mb-2">Ciclo do Evento</p>
        {phases.map((phase, i) => {
          const active = isActive(phase.href, phase.exact);
          return (
            <Link
              key={phase.href}
              href={phase.href}
              className={`flex items-center gap-2.5 px-3 py-[7px] rounded-lg transition-all text-[13px] font-medium mb-0.5 group ${
                active
                  ? "bg-white/[0.08] text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              }`}
            >
              <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                active ? "bg-indigo-500 text-white" : "bg-white/[0.06] text-white/30 group-hover:bg-white/[0.1]"
              }`}>
                {i + 1}
              </span>
              {phase.label}
            </Link>
          );
        })}
      </nav>

      {/* Portal link */}
      <div className="border-t border-white/[0.06] p-3">
        <a
          href={`/portal/${event.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-white/[0.04] rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          Abrir Portal
        </a>
      </div>
    </div>
  );
}
