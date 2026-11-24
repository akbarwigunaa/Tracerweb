import { PARAMETERS } from "@/lib/config/tracer";

export default function GuidePage() {
  const params = Object.entries(PARAMETERS).sort(
    ([, a], [, b]) => a.order - b.order,
  );

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Panduan Penggunaan
      </h1>

      <div className="space-y-6">
        <Section title="Cara Menggunakan Sistem">
          <div className="space-y-4">
            <Step
              num={1}
              title="Upload Data"
              desc="Siapkan file Excel/CSV data tracer: ekspor template DIKTI, ekspor instrumen periode 2027, atau unduhan Google Sheet hasil form tracer. Pastikan ada baris header berisi f-code (f8, f502, dst.). Isi form metadata (institusi, prodi, jenjang, tahun lulusan, tahun tracer, total lulusan), lalu upload file."
            />
            <Step
              num={2}
              title="Proses Analisis"
              desc="Sistem mendeteksi versi instrumen (lama atau periode 2027), membaca data per cabang status F8, mengekstrak hingga 18 parameter tracer study (termasuk item internal H1–H3 bila ada), menghitung statistik, dan menghasilkan narasi otomatis untuk setiap parameter."
            />
            <Step
              num={3}
              title="Lihat Hasil Analisis"
              desc="Buka halaman Hasil Analisis untuk melihat detail statistik, grafik, dan narasi untuk setiap parameter. Data ditampilkan dalam bentuk tabel dan chart interaktif."
            />
            <Step
              num={4}
              title="Buat & Download Laporan"
              desc="Klik tombol 'Buat Laporan Word' untuk menghasilkan dokumen .docx lengkap. Laporan berisi cover, ringkasan, dan analisis per parameter dengan tabel data."
            />
          </div>
        </Section>

        <Section title="Parameter Analisis">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    No
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Parameter
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Tipe Statistik
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    F-Code
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {params.map(([, config]) => (
                  <tr key={config.order}>
                    <td className="px-4 py-2 text-gray-600">{config.order}</td>
                    <td className="px-4 py-2 text-gray-800 font-medium">
                      {config.name}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        {config.statistic_type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500 font-mono text-xs">
                      {config.f_code}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Persyaratan File Excel">
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
            <li>
              Format: <strong>.xlsx</strong>, <strong>.xls</strong>, atau{" "}
              <strong>.csv</strong>
            </li>
            <li>
              Baris header berisi f-code (f8, f502, f505, dst.) di 15 baris
              pertama; data responden dimulai tepat di bawahnya. Template DIKTI
              (judul di baris 1–3, header di baris 4) tetap didukung.
            </li>
            <li>
              Sheet dipilih otomatis: sheet{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                data tracer
              </code>{" "}
              diutamakan, lalu sheet lain yang memuat header f8.
            </li>
            <li>
              Instrumen periode 2027 dikenali dari kolom barunya (f5a0, f5e,
              f1775–f1782, f28–f37): label F14 memakai skala relevansi, F1101
              tanpa kode 4, dan 11 kompetensi dihitung.
            </li>
            <li>
              Kolom opsional (f5e, h1, h2, h3, tempat kerja/studi) boleh tidak
              ada; parameternya dilewati.
            </li>
          </ul>
        </Section>

        <Section title="FAQ">
          <div className="space-y-3">
            <FAQ
              q="Apakah data saya aman?"
              a="Semua data disimpan di database pribadi Anda. Tidak ada data yang dibagikan ke pihak ketiga."
            />
            <FAQ
              q="Format Excel apa yang didukung?"
              a="File Excel/CSV (.xlsx/.xls/.csv) yang memiliki baris header f-code: template DIKTI lama, ekspor instrumen periode 2027, atau Google Sheet hasil form tracer."
            />
            <FAQ
              q="Bisakah mengupload data yang sama dua kali?"
              a="Tidak. Sistem mendeteksi duplikasi berdasarkan kombinasi prodi, tahun lulusan, dan tahun tracer."
            />
            <FAQ
              q="Apa yang terjadi jika ada kolom f-code yang tidak ditemukan?"
              a="Sistem akan memberikan pesan error yang menunjukkan f-code mana yang tidak ditemukan. Pastikan format file sesuai standar DIKTI."
            />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Step({
  num,
  title,
  desc,
}: {
  num: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
        {num}
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="group">
      <summary className="cursor-pointer font-medium text-sm text-gray-800 py-2 hover:text-blue-600 transition-colors">
        {q}
      </summary>
      <p className="text-sm text-gray-600 pl-4 pb-2">{a}</p>
    </details>
  );
}
