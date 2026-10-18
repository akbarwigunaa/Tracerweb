"use client";

import { useRouter } from "next/navigation";

export default function ReportActions({ id }: { id: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus laporan ini?")) return;
    const res = await fetch(`/api/reports/${id}/delete`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <a
        href={`/api/reports/${id}/download`}
        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
      >
        Download
      </a>
      <button
        onClick={handleDelete}
        className="text-red-500 hover:text-red-700 text-xs font-medium"
      >
        Hapus
      </button>
    </div>
  );
}
