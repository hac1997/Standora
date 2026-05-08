import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      map: true,
      stands: { include: { exhibitor: true } },
      exhibitors: true,
      expenses: true,
      staffShifts: { include: { staffMember: true } },
    },
  });

  if (!event) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });

  return NextResponse.json({ event });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.status !== undefined)                data.status                = body.status;
    if (body.name !== undefined)                  data.name                  = body.name;
    if (body.description !== undefined)           data.description           = body.description;
    if (body.type !== undefined)                  data.type                  = body.type;
    if (body.startDate !== undefined)             data.startDate             = new Date(body.startDate);
    if (body.endDate !== undefined)               data.endDate               = new Date(body.endDate);
    if (body.estimatedParticipants !== undefined) data.estimatedParticipants = Number(body.estimatedParticipants);
    if (body.estimatedExhibitors !== undefined)   data.estimatedExhibitors   = Number(body.estimatedExhibitors);

    const event = await prisma.event.update({ where: { id }, data });
    return NextResponse.json({ event });
  } catch (err) {
    console.error("[events PATCH]", err);
    return NextResponse.json({ error: "Erro ao atualizar evento" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[events DELETE]", err);
    return NextResponse.json({ error: "Erro ao excluir evento" }, { status: 500 });
  }
}
