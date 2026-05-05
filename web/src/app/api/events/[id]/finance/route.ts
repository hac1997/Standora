import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const [expenses, stands] = await Promise.all([
    prisma.expense.findMany({ where: { eventId: id }, orderBy: { dueDate: "asc" } }),
    prisma.stand.findMany({ where: { eventId: id } }),
  ]);

  const revenue = stands
    .filter((s) => s.status === "ocupado")
    .reduce((sum, s) => sum + s.basePrice, 0);

  const totalExpenses = expenses
    .filter((e) => e.status === "pago")
    .reduce((sum, e) => sum + e.amount, 0);

  return NextResponse.json({ expenses, revenue, totalExpenses, margin: revenue - totalExpenses });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const { description, category, amount, dueDate } = await req.json();

  const expense = await prisma.expense.create({
    data: {
      eventId: id,
      description,
      category: category || "outros",
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
    },
  });

  return NextResponse.json({ expense }, { status: 201 });
}
