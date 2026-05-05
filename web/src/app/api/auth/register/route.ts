import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, orgName, email, password } = await req.json();

    if (!name || !orgName || !email || !password) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Este email já está em uso." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const organization = await prisma.organization.create({
      data: { name: orgName },
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        organizationId: organization.id,
      },
    });

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
