import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AnalysisDetail from "@/components/analysis-detail";

export const instant = false;

export default async function AnalysisShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tracerStudy = await prisma.tracerStudy.findUnique({
    where: { id: Number(id) },
    include: { analysisResults: { orderBy: { order: "asc" } } },
  });

  if (!tracerStudy) notFound();

  const latestReport = await prisma.report.findFirst({
    where: { tracerStudyId: tracerStudy.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/analysis"
            className="text-sm text-blue-600 hover:text-blue-800 mb-1 inline-block"
          >
            &larr; Kembali ke Daftar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {tracerStudy.namaProdi} ({tracerStudy.jenjang})
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Tahun Lulusan {tracerStudy.tahunLulusan} &middot; Tracer{" "}
            {tracerStudy.tahunTracer} &middot; {tracerStudy.namaInstitusi}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MiniCard label="Total Lulusan" value={tracerStudy.totalLulusan.toLocaleString("id-ID")} />
        <MiniCard label="Total Responden" value={tracerStudy.totalResponden.toLocaleString("id-ID")} />
        <MiniCard label="Response Rate" value={`${Number(tracerStudy.responseRate).toFixed(2)}%`} />
        <MiniCard label="Parameter" value={String(tracerStudy.analysisResults.length)} />
      </div>

      <AnalysisDetail
        results={tracerStudy.analysisResults.map((r) => ({
          ...r,
          resultData: r.resultData as Record<string, unknown>,
          chartConfig: r.chartConfig as Record<string, unknown> | null,
        }))}
        tracerStudyId={tracerStudy.id}
        hasReport={!!latestReport}
      />
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
