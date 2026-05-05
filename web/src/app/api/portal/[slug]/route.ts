import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    select: { id: true, name: true, type: true, startDate: true, endDate: true, description: true, estimatedParticipants: true },
  });

  if (!event) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });

  return NextResponse.json({ event });
}
