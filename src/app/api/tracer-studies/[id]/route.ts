import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const tracerStudy = await prisma.tracerStudy.findUnique({
    where: { id: Number(id) },
  });

  if (!tracerStudy) {
    return NextResponse.json(
      { error: "Data tidak ditemukan." },
      { status: 404 },
    );
  }

  await prisma.tracerStudy.delete({ where: { id: tracerStudy.id } });

  return NextResponse.json({ success: true });
}
