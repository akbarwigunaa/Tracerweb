import { prisma } from "@/lib/prisma";
import { PARAMETERS } from "@/lib/config/tracer";
import { readExcel, type RawData } from "./excel-reader";
import { calculate } from "./statistics";
import { generateNarrative } from "./narrative";
import { generateChartConfig } from "./chart-config";

interface TracerMeta {
  nama_institusi: string;
  nama_prodi: string;
  jenjang: string;
  tahun_lulusan: string;
  tahun_tracer: string;
  total_lulusan: number;
}

function countResponden(rawData: RawData): number {
  const firstKey = Object.keys(rawData)[0];
  if (!firstKey) return 0;
  const firstParam = rawData[firstKey];
  if (Array.isArray(firstParam)) return firstParam.length;
  return 0;
}

export async function processTracer(
  meta: TracerMeta,
  fileBuffer: Buffer,
  filePath: string,
) {
  const tracerStudy = await prisma.tracerStudy.create({
    data: {
      namaInstitusi: meta.nama_institusi,
      namaProdi: meta.nama_prodi,
      jenjang: meta.jenjang,
      tahunLulusan: meta.tahun_lulusan,
      tahunTracer: meta.tahun_tracer,
      totalLulusan: meta.total_lulusan,
      filePath,
      status: "processing",
    },
  });

  try {
    const rawData = readExcel(fileBuffer);
    const totalResponden = countResponden(rawData);
    const responseRate =
      meta.total_lulusan > 0
        ? Math.round((totalResponden / meta.total_lulusan) * 10000) / 100
        : 0;

    await prisma.tracerStudy.update({
      where: { id: tracerStudy.id },
      data: { totalResponden, responseRate },
    });

    const narrativeMeta = {
      prodi: meta.nama_prodi,
      jenjang: meta.jenjang,
      tahun_lulusan: meta.tahun_lulusan,
    };

    for (const [key, paramConfig] of Object.entries(PARAMETERS)) {
      const paramData = rawData[key] ?? [];
      const statsResult = calculate(key, paramConfig, paramData);
      const narrativeText = generateNarrative(key, statsResult, narrativeMeta);
      const chartCfg = generateChartConfig(key, paramConfig, statsResult);

      await prisma.analysisResult.create({
        data: {
          tracerStudyId: tracerStudy.id,
          parameterKey: key,
          parameterName: paramConfig.name,
          statisticType: paramConfig.statistic_type,
          resultData: statsResult,
          chartConfig: chartCfg,
          narrative: narrativeText,
          order: paramConfig.order,
        },
      });
    }

    await prisma.tracerStudy.update({
      where: { id: tracerStudy.id },
      data: { status: "completed" },
    });
  } catch (e) {
    await prisma.tracerStudy.update({
      where: { id: tracerStudy.id },
      data: { status: "failed" },
    });
    throw e;
  }

  return prisma.tracerStudy.findUnique({
    where: { id: tracerStudy.id },
    include: { analysisResults: { orderBy: { order: "asc" } } },
  });
}
