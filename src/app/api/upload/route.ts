import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processTracer } from "@/lib/services/tracer-analysis";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const namaInstitusi = formData.get("nama_institusi") as string;
    const namaProdi = formData.get("nama_prodi") as string;
    const jenjang = formData.get("jenjang") as string;
    const tahunLulusan = formData.get("tahun_lulusan") as string;
    const tahunTracer = formData.get("tahun_tracer") as string;
    const totalLulusan = Number(formData.get("total_lulusan"));
    const file = formData.get("file") as File;

    if (!file || !namaInstitusi || !namaProdi || !jenjang || !tahunLulusan || !tahunTracer || !totalLulusan) {
      return NextResponse.json(
        { error: "Semua field wajib diisi." },
        { status: 400 },
      );
    }

    const existing = await prisma.tracerStudy.findUnique({
      where: {
        tracer_unique: {
          namaProdi,
          tahunLulusan,
          tahunTracer,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Data tracer untuk prodi, tahun lulusan, dan tahun tracer ini sudah ada.",
        },
        { status: 409 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadDir = join(process.cwd(), "storage", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filename = `${Date.now()}_${file.name}`;
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const tracerStudy = await processTracer(
      {
        nama_institusi: namaInstitusi,
        nama_prodi: namaProdi,
        jenjang,
        tahun_lulusan: tahunLulusan,
        tahun_tracer: tahunTracer,
        total_lulusan: totalLulusan,
      },
      buffer,
      `uploads/${filename}`,
    );

    return NextResponse.json({
      success: true,
      tracerStudyId: tracerStudy?.id,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Gagal memproses file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
