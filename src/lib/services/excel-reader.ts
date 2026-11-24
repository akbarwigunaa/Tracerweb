import * as XLSX from "xlsx";
import {
  EXCEL_CONFIG,
  PARAMETERS,
  REQUIRED_PARAMETERS,
  V2_MARKER_CODES,
  appliesToVersion,
  resolveParameter,
  type InstrumentVersion,
} from "@/lib/config/tracer";

export interface CompetencyRawData {
  name: string;
  values_a: (string | number)[];
  values_b: (string | number)[];
}

export type RawData = Record<
  string,
  (string | number)[] | Record<string, CompetencyRawData>
>;

export interface ExcelReadResult {
  data: RawData;
  version: InstrumentVersion;
  totalResponden: number;
  /** Parameter opsional yang dilewati karena kolomnya tidak ada di file. */
  skipped: string[];
}

interface SheetLayout {
  sheet: XLSX.WorkSheet;
  headerRow: number;
  dataStartRow: number;
  /** true bila baris header f-code ditemukan (bukan sekadar posisi baku). */
  detected: boolean;
}

function columnIndexFromString(col: string): number {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 64);
  }
  return result;
}

function cellValue(sheet: XLSX.WorkSheet, row: number, col: number): unknown {
  const cell = sheet[XLSX.utils.encode_cell({ r: row - 1, c: col - 1 })];
  return cell ? cell.v : undefined;
}

function buildFCodeMap(
  sheet: XLSX.WorkSheet,
  headerRow: number,
): Record<string, number> {
  const map: Record<string, number> = {};
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");

  for (let col = range.s.c; col <= range.e.c; col++) {
    const addr = XLSX.utils.encode_cell({ r: headerRow - 1, c: col });
    const cell = sheet[addr];
    if (cell && cell.v != null) {
      const cleaned = String(cell.v).trim().toLowerCase();
      if (map[cleaned] === undefined) map[cleaned] = col + 1;
    }
  }
  return map;
}

/** Baris pertama (dalam rentang pindai) yang memuat header "f8"; null bila tidak ada. */
function detectHeaderRow(sheet: XLSX.WorkSheet): number | null {
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  const lastRow = Math.min(range.e.r + 1, EXCEL_CONFIG.header_scan_rows);
  for (let row = 1; row <= lastRow; row++) {
    for (let col = range.s.c + 1; col <= range.e.c + 1; col++) {
      const v = cellValue(sheet, row, col);
      if (v != null && String(v).trim().toLowerCase() === EXCEL_CONFIG.status_code) {
        return row;
      }
    }
  }
  return null;
}

function findSheet(workbook: XLSX.WorkBook): SheetLayout | null {
  // 1) Sheet mana pun yang memuat baris header f-code.
  const preferred = [...workbook.SheetNames].sort((a, b) => {
    const score = (n: string) =>
      n === EXCEL_CONFIG.sheet_name ? 0 : n.toLowerCase().includes("tracer") ? 1 : 2;
    return score(a) - score(b);
  });
  for (const name of preferred) {
    const sheet = workbook.Sheets[name];
    const headerRow = detectHeaderRow(sheet);
    if (headerRow !== null) {
      return { sheet, headerRow, dataStartRow: headerRow + 1, detected: true };
    }
  }

  // 2) Cadangan: posisi baku template DIKTI pada sheet yang paling cocok.
  const fallback = workbook.Sheets[preferred[0]];
  if (!fallback) return null;
  return {
    sheet: fallback,
    headerRow: EXCEL_CONFIG.header_row,
    dataStartRow: EXCEL_CONFIG.data_start_row,
    detected: false,
  };
}

function detectVersion(fCodeMap: Record<string, number>): InstrumentVersion {
  return V2_MARKER_CODES.some((code) => fCodeMap[code] !== undefined) ? "v2" : "v1";
}

export function readExcel(buffer: Buffer): ExcelReadResult {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const layout = findSheet(workbook);

  if (!layout) {
    const available = workbook.SheetNames.join(", ");
    throw new Error(`Sheet tidak ditemukan. Sheet tersedia: ${available}`);
  }

  const { sheet, headerRow, dataStartRow, detected } = layout;
  const fCodeMap = buildFCodeMap(sheet, headerRow);
  const version = detectVersion(fCodeMap);
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  const highestRow = range.e.r + 1;

  /** Indeks kolom untuk f-code; null bila tidak ada. Huruf kolom baku hanya dipakai bila header tidak terdeteksi. */
  const columnOf = (fCode: string, letter?: string): number | null => {
    const cleaned = fCode.trim().toLowerCase();
    if (fCodeMap[cleaned] !== undefined) return fCodeMap[cleaned];
    if (!detected && letter) return columnIndexFromString(letter);
    return null;
  };

  const statusCol = columnOf(EXCEL_CONFIG.status_code, PARAMETERS.status_setelah_lulus.column);
  if (statusCol === null) {
    throw new Error('Kolom untuk f-code "f8" tidak ditemukan di header Excel.');
  }

  // Baris responden = baris yang F8-nya terisi; nilai F8 dipakai untuk filter per cabang.
  const rows: { row: number; f8: number }[] = [];
  for (let row = dataStartRow; row <= highestRow; row++) {
    const v = cellValue(sheet, row, statusCol);
    if (v != null && String(v).trim() !== "") rows.push({ row, f8: Math.floor(Number(v)) });
  }

  const readColumn = (col: number, f8Filter?: number[]): (string | number)[] => {
    const values: (string | number)[] = [];
    for (const { row, f8 } of rows) {
      if (f8Filter && !f8Filter.includes(f8)) continue;
      const v = cellValue(sheet, row, col);
      if (v != null && v !== "") values.push(v as string | number);
    }
    return values;
  };

  const data: RawData = {};
  const skipped: string[] = [];
  const f8FilterOf = (filter?: number[]) => (version === "v2" ? filter : undefined);

  for (const [key, baseParam] of Object.entries(PARAMETERS)) {
    if (!appliesToVersion(baseParam, version)) continue;
    const param = resolveParameter(baseParam, version);
    const required = REQUIRED_PARAMETERS.has(key);

    if (param.statistic_type === "index" && param.competencies) {
      const compResult: Record<string, CompetencyRawData> = {};
      for (const [compKey, comp] of Object.entries(param.competencies)) {
        if (!appliesToVersion(comp, version)) continue;
        const colA = columnOf(comp.column_a);
        const colB = columnOf(comp.column_b);
        if (colA === null || colB === null) {
          if (comp.versions) continue; // kompetensi tambahan v2 boleh tidak ada
          throw new Error(
            `Kolom untuk f-code "${colA === null ? comp.column_a : comp.column_b}" tidak ditemukan di header Excel.`,
          );
        }
        compResult[compKey] = {
          name: comp.name,
          values_a: readColumn(colA, f8FilterOf(param.f8_filter)),
          values_b: readColumn(colB, f8FilterOf(param.f8_filter)),
        };
      }
      data[key] = compResult;
      continue;
    }

    const col = columnOf(param.f_code, param.column);
    if (col === null) {
      if (required) {
        throw new Error(`Kolom untuk f-code "${param.f_code}" tidak ditemukan di header Excel.`);
      }
      skipped.push(key);
      continue;
    }
    data[key] = readColumn(col, f8FilterOf(param.f8_filter));
  }

  return { data, version, totalResponden: rows.length, skipped };
}
