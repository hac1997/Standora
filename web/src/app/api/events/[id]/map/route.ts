import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const map = await prisma.eventMap.findUnique({ where: { eventId: id } });
    if (!map) return NextResponse.json({ map: null }, { status: 200 });
    return NextResponse.json({ map });
  } catch (err) {
    console.error("[map GET]", err);
    return NextResponse.json({ error: "Erro ao carregar mapa" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const { canvasJson, stands, floorPlanUrl, scaleRatio } = body;

    console.log("[map PUT] eventId:", id, "floorPlanUrl:", floorPlanUrl, "stands:", stands?.length);

    const updateData: Record<string, unknown> = { canvasJson };
    if (floorPlanUrl !== undefined) updateData.floorPlanUrl = floorPlanUrl;
    if (scaleRatio   !== undefined) updateData.scaleRatio   = scaleRatio;

    const map = await prisma.eventMap.upsert({
      where:  { eventId: id },
      update: updateData,
      create: { eventId: id, canvasJson, floorPlanUrl: floorPlanUrl ?? null, scaleRatio: scaleRatio ?? null },
    });

    if (stands && Array.isArray(stands)) {
      await prisma.stand.deleteMany({ where: { eventId: id } });
      if (stands.length > 0) {
        await prisma.stand.createMany({
          data: stands.map((s: {
            name: string; widthM: number; depthM: number;
            positionX: number; positionY: number;
            colorHex: string; basePrice: number; status: string; photoUrl?: string;
          }) => ({
            eventId: id,
            name:       s.name,
            widthM:     s.widthM,
            depthM:     s.depthM,
            positionX:  s.positionX,
            positionY:  s.positionY,
            colorHex:   s.colorHex,
            basePrice:  s.basePrice,
            status:     s.status,
            photoUrl:   s.photoUrl ?? null,
          })),
        });
      }
    }

    return NextResponse.json({ map });
  } catch (err) {
    console.error("[map PUT] Erro:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
