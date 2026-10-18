import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const instant = false;

export default async function AnalysisIndexPage() {
  type StudyWithCount = Awaited<ReturnType<typeof prisma.tracerStudy.findMany<{ include: { _count: { select: { analysisResults: true } } } }>>>;
  let tracerStudies: StudyWithCount = [];
  try {
    tracerStudies = await prisma.tracerStudy.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { analysisResults: true } } },
    });
  } catch {
    // DB not connected
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Hasil Analisis</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {tracerStudies.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Belum ada data analisis.{" "}
            <Link href="/upload" className="text-blue-600 hover:underline">
              Upload data tracer study
            </Link>{" "}
            terlebih dahulu.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">
                    Program Studi
                  </th>
                  <th className="px-6 py-3 text-left font-medium">Jenjang</th>
                  <th className="px-6 py-3 text-left font-medium">
                    Tahun Lulusan
                  </th>
                  <th className="px-6 py-3 text-right font-medium">
                    Response Rate
                  </th>
                  <th className="px-6 py-3 text-center font-medium">
                    Parameter
                  </th>
                  <th className="px-6 py-3 text-center font-medium">Status</th>
                  <th className="px-6 py-3 text-center font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tracerStudies.map((study) => (
                  <tr key={study.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {study.namaProdi}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {study.jenjang}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {study.tahunLulusan}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-600">
                      {Number(study.responseRate).toFixed(2)}%
                    </td>
                    <td className="px-6 py-3 text-center text-gray-600">
                      {study._count.analysisResults}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          study.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : study.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {study.status === "completed"
                          ? "Selesai"
                          : study.status === "failed"
                            ? "Gagal"
                            : "Proses"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {study.status === "completed" && (
                        <Link
                          href={`/analysis/${study.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Detail
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
