import type { ParameterConfig } from "@/lib/config/tracer";

/* eslint-disable @typescript-eslint/no-explicit-any */

const COLORS = [
  "#4e79a7",
  "#f28e2b",
  "#e15759",
  "#76b7b2",
  "#59a14f",
  "#edc948",
  "#b07aa1",
  "#ff9da7",
  "#9c755f",
  "#bab0ac",
];

function buildPie(config: ParameterConfig, stats: any): any {
  const frequencies = stats.frequencies ?? [];
  const labels = frequencies.map((f: any) => f.label);
  const data = frequencies.map((f: any) => f.count);
  const colors = COLORS.slice(0, labels.length);

  return {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: config.name,
          font: { size: 14, weight: "bold" },
        },
        legend: { position: "bottom", labels: { padding: 15 } },
      },
    },
  };
}

function buildBar(config: ParameterConfig, stats: any): any {
  const frequencies = stats.frequencies ?? [];
  const labels = frequencies.map((f: any) => f.label);
  const data = frequencies.map((f: any) => f.count);
  const colors = COLORS.slice(0, labels.length);

  return {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Jumlah Responden",
          data,
          backgroundColor: colors,
          borderWidth: 1,
          borderColor: colors.map((c: string) => c + "cc"),
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: config.name,
          font: { size: 14, weight: "bold" },
        },
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 },
          title: { display: true, text: "Jumlah" },
        },
        x: { title: { display: true, text: config.name } },
      },
    },
  };
}

function buildGroupedBar(config: ParameterConfig, stats: any): any {
  const competencies = stats.competencies ?? {};
  const labels = Object.values(competencies).map((c: any) => c.name);
  const dataA = Object.values(competencies).map((c: any) => c.index_a);
  const dataB = Object.values(competencies).map((c: any) => c.index_b);

  return {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Dikuasai Saat Lulus",
          data: dataA,
          backgroundColor: "#4e79a7",
          borderWidth: 1,
          borderColor: "#4e79a7cc",
          borderRadius: 4,
        },
        {
          label: "Dibutuhkan dalam Pekerjaan",
          data: dataB,
          backgroundColor: "#f28e2b",
          borderWidth: 1,
          borderColor: "#f28e2bcc",
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: config.name,
          font: { size: 14, weight: "bold" },
        },
        legend: { position: "bottom", labels: { padding: 15 } },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: { stepSize: 1 },
          title: { display: true, text: "Indeks (1-5)" },
        },
        x: { title: { display: true, text: "Kompetensi" } },
      },
    },
  };
}

export function generateChartConfig(
  _parameterKey: string,
  config: ParameterConfig,
  stats: any,
): any | null {
  const chartType = config.chart_type;
  if (!chartType) return null;

  switch (chartType) {
    case "pie":
      return buildPie(config, stats);
    case "bar":
      return buildBar(config, stats);
    case "grouped_bar":
      return buildGroupedBar(config, stats);
    default:
      return null;
  }
}
