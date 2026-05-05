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
  const body = await req.json();

  const event = await prisma.event.update({
    where: { id },
    data: {
      status: body.status,
      name: body.name,
      description: body.description,
    },
  });

  return NextResponse.json({ event });
}
