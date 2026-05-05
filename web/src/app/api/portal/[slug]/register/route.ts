import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { companyName, cnpj, contactName, email, phone, standId } = await req.json();

  if (!companyName || !contactName || !email) {
    return NextResponse.json({ error: "Nome da empresa, responsável e email são obrigatórios." }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });

  const exhibitor = await prisma.exhibitor.create({
    data: {
      eventId: event.id,
      companyName,
      cnpj: cnpj || null,
      contactName,
      email,
      phone: phone || null,
      status: "pendente",
    },
  });

  if (standId) {
    await prisma.stand.updateMany({
      where: { id: standId, eventId: event.id, status: "disponivel" },
      data: { status: "reservado", exhibitorId: exhibitor.id },
    });
  }

  return NextResponse.json({ exhibitor }, { status: 201 });
}
