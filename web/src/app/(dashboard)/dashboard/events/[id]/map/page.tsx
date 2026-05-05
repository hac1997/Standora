import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { MapEditorWrapper } from "./MapEditorWrapper";

export default async function MapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let event: { id: string; name: string; slug: string; _count: { stands: number } } | null = null;
  try {
    event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true, _count: { select: { stands: true } } },
    });
  } catch { event = null; }

  if (!event) notFound();

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a2e] tracking-tight">Editor de Mapa</h1>
          <p className="text-xs text-gray-400 mt-0.5">{event._count.stands} estandes · Arraste para posicionar · Clique para editar</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-[#e2e4ea] overflow-hidden shadow-sm">
        <MapEditorWrapper eventId={id} />
      </div>
    </div>
  );
}
