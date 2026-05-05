import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";

const MapEditor = dynamic(() => import("@/components/map/MapEditor"), { ssr: false });

export default async function MapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let event: Awaited<ReturnType<typeof prisma.event.findUnique>> & { _count: { stands: number } } | null = null;
  try {
    event = await prisma.event.findUnique({
      where: { id },
      include: { map: true, _count: { select: { stands: true } } },
    }) as typeof event;
  } catch { event = null; }

  if (!event) notFound();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <Link href={`/dashboard/events/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            {event.name}
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight">Editor de Mapa</h1>
          <p className="text-xs text-slate-500 mt-0.5">{event._count.stands} estandes · Arraste para posicionar · Clique para editar</p>
        </div>
        <div className="flex gap-2 items-center">
          <a
            href={`/portal/${event.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 border border-white/[0.08] rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            Link do Expositor
          </a>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <MapEditor eventId={id} />
      </div>
    </div>
  );
}
