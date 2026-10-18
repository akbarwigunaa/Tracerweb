import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
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

  if (!existsSync(absolutePath)) {
    return NextResponse.json(
      { error: "File laporan tidak ditemukan." },
      { status: 404 },
    );
  }

  const buffer = await readFile(absolutePath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${report.filename}"`,
    },
  });
}
