import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const shifts = await prisma.staffShift.findMany({
    where: { eventId: id },
    include: { staffMember: true },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json({ shifts });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const { staffMemberId, sector, startTime, endTime } = await req.json();

  const shift = await prisma.staffShift.create({
    data: {
      eventId: id,
      staffMemberId,
      sector,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    },
  });

  return NextResponse.json({ shift }, { status: 201 });
}
