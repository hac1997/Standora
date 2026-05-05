import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const staff = await prisma.staffMember.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ staff });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { name, email, phone, role, type, dailyRate } = await req.json();

  const member = await prisma.staffMember.create({
    data: {
      name,
      email,
      phone: phone || null,
      role: role || "operacional",
      type: type || "proprio",
      dailyRate: parseFloat(dailyRate) || 0,
    },
  });

  return NextResponse.json({ member }, { status: 201 });
}
