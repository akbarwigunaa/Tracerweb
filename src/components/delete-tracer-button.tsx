"use client";

import { useRouter } from "next/navigation";

export default function DeleteTracerButton({ id }: { id: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus data tracer study ini?")) return;

    const res = await fetch(`/api/tracer-studies/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-500 hover:text-red-700 text-xs font-medium"
    >
      Hapus
    </button>
  );
}
