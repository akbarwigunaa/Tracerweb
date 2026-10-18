import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id: Number(id) },
  });

  if (!report) {
    return NextResponse.json(
      { error: "Laporan tidak ditemukan." },
      { status: 404 },
    );
  }

  const absolutePath = join(process.cwd(), "storage", report.filePath);
  if (existsSync(absolutePath)) {
    await unlink(absolutePath);
  }

  await prisma.report.delete({ where: { id: report.id } });

  return NextResponse.json({ success: true });
}
