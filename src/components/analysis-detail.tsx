"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ChartRenderer from "./chart-renderer";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface AnalysisResult {
  id: number;
  parameterKey: string;
  parameterName: string;
  statisticType: string;
  resultData: Record<string, any>;
  chartConfig: Record<string, any> | null;
  narrative: string | null;
  order: number;
}

export default function AnalysisDetail({
  results,
  tracerStudyId,
  hasReport,
}: {
  results: AnalysisResult[];
  tracerStudyId: number;
  hasReport: boolean;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracerStudyId }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/reports");
      } else {
        alert(data.error || "Gagal membuat laporan.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {generating ? "Membuat..." : "Buat Laporan Word"}
        </button>
        {hasReport && (
          <a
            href="/reports"
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            Lihat Laporan
          </a>
        )}
      </div>

      <div className="space-y-6">
        {results.map((result) => (
          <div
            key={result.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                {result.order}. {result.parameterName}
              </h3>
              <span className="text-xs text-gray-500 mt-0.5 inline-block">
                {typeLabel(result.statisticType)}
              </span>
            </div>

            <div className="p-6">
              {result.narrative && (
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  {result.narrative}
                </p>
              )}

              {result.chartConfig && (
                <div className="mb-4">
                  <ChartRenderer config={result.chartConfig} />
                </div>
              )}

              <ResultTable
                type={result.statisticType}
                data={result.resultData}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function typeLabel(t: string): string {
  const m: Record<string, string> = {
    frequency: "Distribusi Frekuensi",
    mean_median: "Rata-rata & Median",
    mean: "Rata-rata",
    sum: "Total",
    display: "Daftar Data",
    index: "Indeks Kompetensi",
  };
  return m[t] ?? t;
}

function ResultTable({ type, data }: { type: string; data: any }) {
  switch (type) {
    case "frequency":
      return <FrequencyTable data={data} />;
    case "mean_median":
      return <MeanMedianTable data={data} />;
    case "mean":
      return <MeanTable data={data} />;
    case "sum":
      return <SumTable data={data} />;
    case "display":
      return <DisplayList data={data} />;
    case "index":
      return <IndexTable data={data} />;
    default:
      return null;
  }
}

function FrequencyTable({ data }: { data: any }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left font-medium text-gray-600">
            Kategori
          </th>
          <th className="px-4 py-2 text-right font-medium text-gray-600">
            Jumlah
          </th>
          <th className="px-4 py-2 text-right font-medium text-gray-600">
            Persentase
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {(data.frequencies ?? []).map((f: any, i: number) => (
          <tr key={i}>
            <td className="px-4 py-2 text-gray-800">{f.label}</td>
            <td className="px-4 py-2 text-right text-gray-600">{f.count}</td>
            <td className="px-4 py-2 text-right text-gray-600">
              {Number(f.percentage).toFixed(1)}%
            </td>
          </tr>
        ))}
        <tr className="bg-gray-50 font-medium">
          <td className="px-4 py-2 text-gray-800">Total</td>
          <td className="px-4 py-2 text-right text-gray-800">{data.total}</td>
          <td className="px-4 py-2 text-right text-gray-800">100%</td>
        </tr>
      </tbody>
    </table>
  );
}

function MeanMedianTable({ data }: { data: any }) {
  const fmt = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;
  return (
    <table className="w-full text-sm">
      <tbody className="divide-y divide-gray-100">
        <KVRow label="Rata-rata (Mean)" value={fmt(data.mean)} />
        <KVRow label="Median" value={fmt(data.median)} />
        <KVRow label="Minimum" value={fmt(data.min)} />
        <KVRow label="Maksimum" value={fmt(data.max)} />
        <KVRow label="Jumlah Data" value={String(data.count)} />
      </tbody>
    </table>
  );
}

function MeanTable({ data }: { data: any }) {
  return (
    <table className="w-full text-sm">
      <tbody className="divide-y divide-gray-100">
        <KVRow label="Rata-rata" value={`${data.mean} bulan`} />
        <KVRow label="Jumlah Data" value={String(data.count)} />
      </tbody>
    </table>
  );
}

function SumTable({ data }: { data: any }) {
  return (
    <table className="w-full text-sm">
      <tbody className="divide-y divide-gray-100">
        <KVRow label="Total" value={Number(data.total_sum).toLocaleString("id-ID")} />
        <KVRow label="Rata-rata" value={Number(data.mean).toFixed(1)} />
        <KVRow label="Jumlah Data" value={String(data.count)} />
      </tbody>
    </table>
  );
}

function DisplayList({ data }: { data: any }) {
  if (!data.values || data.values.length === 0) {
    return <p className="text-sm text-gray-500 italic">Tidak ada data.</p>;
  }
  return (
    <div>
      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
        {data.values.map((v: string, i: number) => (
          <li key={i}>{v}</li>
        ))}
      </ul>
      <p className="text-xs text-gray-400 mt-2 italic">
        Total: {data.count} data
      </p>
    </div>
  );
}

function IndexTable({ data }: { data: any }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left font-medium text-gray-600">
            Kompetensi
          </th>
          <th className="px-4 py-2 text-right font-medium text-gray-600">
            Dikuasai
          </th>
          <th className="px-4 py-2 text-right font-medium text-gray-600">
            Dibutuhkan
          </th>
          <th className="px-4 py-2 text-right font-medium text-gray-600">
            Gap
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {Object.values(data.competencies ?? {}).map((c: any, i: number) => (
          <tr key={i}>
            <td className="px-4 py-2 text-gray-800">{c.name}</td>
            <td className="px-4 py-2 text-right text-gray-600">
              {Number(c.index_a).toFixed(2)}
            </td>
            <td className="px-4 py-2 text-right text-gray-600">
              {Number(c.index_b).toFixed(2)}
            </td>
            <td
              className={`px-4 py-2 text-right font-medium ${c.gap < 0 ? "text-red-600" : "text-green-600"}`}
            >
              {Number(c.gap).toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function KVRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="px-4 py-2 font-medium text-gray-700 bg-gray-50 w-1/3">
        {label}
      </td>
      <td className="px-4 py-2 text-right text-gray-800">{value}</td>
    </tr>
  );
}
