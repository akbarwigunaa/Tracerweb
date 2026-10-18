import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildReport } from "@/lib/services/docx-builder";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const { tracerStudyId } = await request.json();

    const tracerStudy = await prisma.tracerStudy.findUnique({
      where: { id: tracerStudyId },
      include: { analysisResults: { orderBy: { order: "asc" } } },
    });

    if (!tracerStudy) {
      return NextResponse.json(
        { error: "Tracer study tidak ditemukan." },
        { status: 404 },
      );
    }

    if (tracerStudy.status !== "completed") {
      return NextResponse.json(
        { error: "Analisis belum selesai." },
        { status: 400 },
      );
    }

    if (tracerStudy.analysisResults.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada hasil analisis." },
        { status: 400 },
      );
    }

    const doc = buildReport(tracerStudy, tracerStudy.analysisResults);
    const docBuffer = await doc.build();

    const filename = `Laporan_Tracer_${tracerStudy.namaProdi.replace(/ /g, "_")}_${tracerStudy.tahunLulusan}_${tracerStudy.tahunTracer}.docx`;
    const reportsDir = join(process.cwd(), "storage", "reports");
    await mkdir(reportsDir, { recursive: true });
    const filePath = join(reportsDir, filename);
    await writeFile(filePath, docBuffer);

    const report = await prisma.report.create({
      data: {
        tracerStudyId: tracerStudy.id,
        filename,
        filePath: `reports/${filename}`,
        fileSize: docBuffer.length,
      },
    });

    return NextResponse.json({ success: true, reportId: report.id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Gagal membuat laporan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
