"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal memproses file.");
        return;
      }

      router.push(`/analysis/${data.tracerStudyId}`);
    } catch {
      setError("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Upload Data Tracer Study
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Informasi Tracer Study
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload file Excel format DIKTI untuk dianalisis secara otomatis.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Field label="Nama Institusi" name="nama_institusi" required defaultValue="Universitas Muhammadiyah Sidoarjo" />
          <Field label="Program Studi" name="nama_prodi" required placeholder="Contoh: Informatika" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenjang <span className="text-red-500">*</span>
            </label>
            <select
              name="jenjang"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="S1">S1</option>
              <option value="S2">S2</option>
              <option value="S3">S3</option>
              <option value="D3">D3</option>
              <option value="D4">D4</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Tahun Lulusan"
              name="tahun_lulusan"
              required
              type="number"
              placeholder="2023"
            />
            <Field
              label="Tahun Tracer"
              name="tahun_tracer"
              required
              type="number"
              placeholder="2024"
            />
          </div>

          <Field
            label="Total Lulusan"
            name="total_lulusan"
            required
            type="number"
            placeholder="Jumlah seluruh lulusan"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Excel (.xlsx) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="file"
              accept=".xlsx,.xls"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: Excel DIKTI dengan sheet &quot;data tracer&quot;, header
              f-code di baris 4, data mulai baris 5.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Memproses..." : "Upload & Analisis"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}
