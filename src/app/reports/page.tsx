import { prisma } from "@/lib/prisma";
import ReportActions from "@/components/report-actions";

export const instant = false;

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB"];
  let size = bytes;
  let idx = 0;
  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024;
    idx++;
  }
  return `${Math.round(size * 10) / 10} ${units[idx]}`;
}

export default async function ReportsPage() {
  type ReportWithStudy = Awaited<ReturnType<typeof prisma.report.findMany<{ include: { tracerStudy: true } }>>>;
  let reports: ReportWithStudy = [];
  try {
    reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: { tracerStudy: true },
    });
  } catch {
    // DB not connected
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Laporan</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {reports.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Belum ada laporan. Buat laporan dari halaman Hasil Analisis.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">
                    Nama File
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    Program Studi
                  </th>
                  <th className="px-6 py-3 text-left font-medium">Tahun</th>
                  <th className="px-6 py-3 text-right font-medium">Ukuran</th>
                  <th className="px-6 py-3 text-left font-medium">Dibuat</th>
                  <th className="px-6 py-3 text-center font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {report.filename}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {report.tracerStudy.namaProdi}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {report.tracerStudy.tahunLulusan}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-600">
                      {formatFileSize(report.fileSize)}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {new Date(report.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <ReportActions id={report.id} />
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
