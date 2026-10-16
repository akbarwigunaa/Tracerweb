import { NARRATIVES, SECOND_TEXT_TEMPLATE } from "@/lib/config/narratives";

/* eslint-disable @typescript-eslint/no-explicit-any */

function formatNumber(value: number): string {
  return value.toLocaleString("id-ID");
}

function shouldFormatCurrency(value: number): boolean {
  return value > 10000;
}

export function generateNarrative(
  parameterKey: string,
  stats: Record<string, any>,
  meta: { prodi?: string; jenjang?: string; tahun_lulusan?: string } = {},
): string {
  const template = NARRATIVES[parameterKey];
  if (!template) return "";

  const replacements: Record<string, string> = {
    prodi: meta.prodi ?? "-",
    jenjang: meta.jenjang ?? "-",
    tahun_lulusan: meta.tahun_lulusan ?? "-",
    total: String(stats.total ?? stats.count ?? 0),
    top_category: stats.top_category ?? "-",
    top_count: String(stats.top_count ?? 0),
    top_pct: String(stats.top_pct ?? 0),
    second_category: stats.second_category ?? "-",
    second_count: String(stats.second_count ?? 0),
    second_pct: String(stats.second_pct ?? 0),
    top_competency: stats.top_competency ?? "-",
    top_index_a: String(stats.top_index_a ?? 0),
    gap_competency: stats.gap_competency ?? "-",
    gap_value: String(stats.gap_value ?? 0),
  };

  if (stats.mean !== undefined) {
    replacements.mean = shouldFormatCurrency(stats.mean)
      ? formatNumber(stats.mean)
      : String(stats.mean);
  }
  if (stats.median !== undefined) {
    replacements.median = formatNumber(stats.median);
  }
  if (stats.min !== undefined) {
    replacements.min = formatNumber(stats.min);
  }
  if (stats.max !== undefined) {
    replacements.max = formatNumber(stats.max);
  }
  if (stats.total_sum !== undefined) {
    replacements.total_sum = formatNumber(stats.total_sum);
  }

  let secondText = "";
  if ((stats.second_count ?? 0) > 0) {
    secondText = SECOND_TEXT_TEMPLATE.replace(
      ":second_category",
      stats.second_category ?? "-",
    )
      .replace(":second_count", String(stats.second_count ?? 0))
      .replace(":second_pct", String(stats.second_pct ?? 0));
  }
  replacements.second_text = secondText;

  const sortedKeys = Object.keys(replacements).sort(
    (a, b) => b.length - a.length,
  );

  let result = template;
  for (const key of sortedKeys) {
    result = result.replaceAll(`:${key}`, replacements[key]);
  }

  return result;
}
