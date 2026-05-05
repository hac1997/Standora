import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const map = await prisma.eventMap.findUnique({ where: { eventId: id } });
  if (!map) return NextResponse.json({ error: "Mapa não encontrado" }, { status: 404 });
  return NextResponse.json({ map });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const { canvasJson, stands } = await req.json();

  const map = await prisma.eventMap.upsert({
    where: { eventId: id },
    update: { canvasJson },
    create: { eventId: id, canvasJson },
  });

  if (stands && Array.isArray(stands)) {
    await prisma.stand.deleteMany({ where: { eventId: id } });
    if (stands.length > 0) {
      await prisma.stand.createMany({
        data: stands.map((s: {
          name: string;
          widthM: number;
          depthM: number;
          positionX: number;
          positionY: number;
          colorHex: string;
          basePrice: number;
          status: string;
        }) => ({
          eventId: id,
          name: s.name,
          widthM: s.widthM,
          depthM: s.depthM,
          positionX: s.positionX,
          positionY: s.positionY,
          colorHex: s.colorHex,
          basePrice: s.basePrice,
          status: s.status,
        })),
      });
    }
  }

  return NextResponse.json({ map });
}
