import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteTracerButton from "@/components/delete-tracer-button";

export const instant = false;

export default async function DashboardPage() {
  let tracerStudies: Awaited<ReturnType<typeof prisma.tracerStudy.findMany>> = [];
  let totalReports = 0;

  try {
    tracerStudies = await prisma.tracerStudy.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { reports: true } } },
    });
    totalReports = await prisma.report.count();
  } catch {
    // DB not connected yet — show empty state
  }

  const totalStudies = tracerStudies.length;
  const completedStudies = tracerStudies.filter(
    (s) => s.status === "completed",
  ).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Tracer Study"
          value={totalStudies}
          color="blue"
        />
        <StatCard
          title="Analisis Selesai"
          value={completedStudies}
          color="green"
        />
        <StatCard title="Laporan Dibuat" value={totalReports} color="purple" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Data Tracer Study
          </h2>
          <Link
            href="/upload"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Upload Baru
          </Link>
        </div>

        {tracerStudies.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Belum ada data tracer study. Mulai dengan mengupload file Excel.
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
                  <th className="px-6 py-3 text-left font-medium">
                    Tahun Tracer
                  </th>
                  <th className="px-6 py-3 text-right font-medium">
                    Responden
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
                    <td className="px-6 py-3 text-gray-600">
                      {study.tahunTracer}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-600">
                      {study.totalResponden}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <StatusBadge status={study.status} />
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {study.status === "completed" && (
                          <Link
                            href={`/analysis/${study.id}`}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            Lihat
                          </Link>
                        )}
                        <DeleteTracerButton id={study.id} />
                      </div>
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

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: "blue" | "green" | "purple";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    processing: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };
  const labelMap: Record<string, string> = {
    completed: "Selesai",
    processing: "Proses",
    failed: "Gagal",
  };
  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${map[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {labelMap[status] ?? status}
    </span>
  );
}
