import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const orgId = (session.user as { organizationId?: string }).organizationId;
  if (!orgId) return NextResponse.json({ events: [] });

  const events = await prisma.event.findMany({
    where: { organizationId: orgId },
    include: {
      _count: { select: { stands: true, exhibitors: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const orgId = (session.user as { organizationId?: string }).organizationId;
  if (!orgId) return NextResponse.json({ error: "Organização não encontrada" }, { status: 400 });

  try {
    const body = await req.json();
    const { name, type, startDate, endDate, description, estimatedParticipants, estimatedExhibitors } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: "Nome, data de início e fim são obrigatórios." }, { status: 400 });
    }

    let slug = generateSlug(name);
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const event = await prisma.event.create({
      data: {
        organizationId: orgId,
        name,
        slug,
        type: type || "feira",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description: description || null,
        estimatedParticipants: parseInt(estimatedParticipants) || 0,
        estimatedExhibitors: parseInt(estimatedExhibitors) || 0,
        map: { create: {} },
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar evento." }, { status: 500 });
  }
}
