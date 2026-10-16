import type { ParameterConfig } from "@/lib/config/tracer";
import type { CompetencyRawData } from "./excel-reader";

/* eslint-disable @typescript-eslint/no-explicit-any */

function filterNumeric(data: any[]): number[] {
  return data
    .map((v) => (typeof v === "number" ? v : parseFloat(String(v))))
    .filter((v) => !isNaN(v));
}

function calculateFrequency(
  config: ParameterConfig,
  rawData: (string | number)[],
): Record<string, any> {
  const categories = config.categories ?? {};
  const hasRanges = !!config.category_ranges;

  const counts: Record<number, number> = {};
  for (const key of Object.keys(categories)) {
    counts[Number(key)] = 0;
  }

  for (const value of rawData) {
    if (hasRanges && config.category_ranges) {
      const numericValue = parseFloat(String(value));
      for (const [catKey, [min, max]] of Object.entries(
        config.category_ranges,
      )) {
        if (numericValue >= min && (max === null || numericValue <= max)) {
          counts[Number(catKey)]++;
          break;
        }
      }
    } else {
      const intValue = Math.floor(Number(value));
      if (counts[intValue] !== undefined) {
        counts[intValue]++;
      }
    }
  }

  const total = Object.values(counts).reduce((s, c) => s + c, 0);
  const frequencies: {
    key: number;
    label: string;
    count: number;
    percentage: number;
  }[] = [];

  for (const [key, label] of Object.entries(categories)) {
    const count = counts[Number(key)];
    frequencies.push({
      key: Number(key),
      label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    });
  }

  frequencies.sort((a, b) => b.count - a.count);

  const top = frequencies[0] ?? null;
  const second = frequencies[1] ?? null;

  return {
    total,
    frequencies,
    top_category: top?.label ?? "-",
    top_count: top?.count ?? 0,
    top_pct: top?.percentage ?? 0,
    second_category: second?.label ?? "-",
    second_count: second?.count ?? 0,
    second_pct: second?.percentage ?? 0,
  };
}

function calculateMeanMedian(rawData: (string | number)[]): Record<string, any> {
  const numeric = filterNumeric(rawData);

  if (numeric.length === 0) {
    return { mean: 0, median: 0, min: 0, max: 0, count: 0 };
  }

  numeric.sort((a, b) => a - b);
  const count = numeric.length;
  const mid = Math.floor(count / 2);
  const median =
    count % 2 === 0 ? (numeric[mid - 1] + numeric[mid]) / 2 : numeric[mid];

  return {
    mean: Math.round(numeric.reduce((s, v) => s + v, 0) / count),
    median: Math.round(median),
    min: Math.min(...numeric),
    max: Math.max(...numeric),
    count,
  };
}

function calculateMean(rawData: (string | number)[]): Record<string, any> {
  const numeric = filterNumeric(rawData);
  if (numeric.length === 0) return { mean: 0, count: 0 };

  return {
    mean:
      Math.round((numeric.reduce((s, v) => s + v, 0) / numeric.length) * 10) /
      10,
    count: numeric.length,
  };
}

function calculateSum(rawData: (string | number)[]): Record<string, any> {
  const numeric = filterNumeric(rawData);
  const count = numeric.length;
  const totalSum = numeric.reduce((s, v) => s + v, 0);

  return {
    total_sum: totalSum,
    mean: count > 0 ? Math.round((totalSum / count) * 10) / 10 : 0,
    count,
  };
}

function calculateDisplay(rawData: (string | number)[]): Record<string, any> {
  const values = rawData
    .map((v) => String(v).trim())
    .filter((v) => v !== "");

  return { values, count: values.length };
}

function calculateIndex(
  rawData: Record<string, CompetencyRawData>,
): Record<string, any> {
  const competencies: Record<string, any> = {};
  let topIndexA = 0;
  let topCompetency = "";
  let maxGap = 0;
  let gapCompetency = "";

  for (const [compKey, comp] of Object.entries(rawData)) {
    const numericA = filterNumeric(comp.values_a);
    const numericB = filterNumeric(comp.values_b);

    const indexA =
      numericA.length > 0
        ? Math.round((numericA.reduce((s, v) => s + v, 0) / numericA.length) * 100) / 100
        : 0;
    const indexB =
      numericB.length > 0
        ? Math.round((numericB.reduce((s, v) => s + v, 0) / numericB.length) * 100) / 100
        : 0;
    const gap = Math.round((indexB - indexA) * 100) / 100;

    competencies[compKey] = {
      name: comp.name,
      index_a: indexA,
      index_b: indexB,
      gap,
      count_a: numericA.length,
      count_b: numericB.length,
    };

    if (indexA > topIndexA) {
      topIndexA = indexA;
      topCompetency = comp.name;
    }
    if (Math.abs(gap) > Math.abs(maxGap)) {
      maxGap = gap;
      gapCompetency = comp.name;
    }
  }

  return {
    competencies,
    top_competency: topCompetency,
    top_index_a: topIndexA,
    gap_competency: gapCompetency,
    gap_value: maxGap,
  };
}

export function calculate(
  _parameterKey: string,
  config: ParameterConfig,
  rawData: any,
): Record<string, any> {
  switch (config.statistic_type) {
    case "frequency":
      return calculateFrequency(config, rawData as (string | number)[]);
    case "mean_median":
      return calculateMeanMedian(rawData as (string | number)[]);
    case "mean":
      return calculateMean(rawData as (string | number)[]);
    case "sum":
      return calculateSum(rawData as (string | number)[]);
    case "display":
      return calculateDisplay(rawData as (string | number)[]);
    case "index":
      return calculateIndex(rawData as Record<string, CompetencyRawData>);
    default:
      throw new Error(
        `Tipe statistik "${config.statistic_type}" tidak dikenali.`,
      );
  }
}
