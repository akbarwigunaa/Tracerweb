import * as XLSX from "xlsx";
import { EXCEL_CONFIG, PARAMETERS } from "@/lib/config/tracer";

export interface CompetencyRawData {
  name: string;
  values_a: (string | number)[];
  values_b: (string | number)[];
}

export type RawData = Record<
  string,
  (string | number)[] | Record<string, CompetencyRawData>
>;

function columnIndexFromString(col: string): number {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 64);
  }
  return result;
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
      map[cleaned] = col + 1;
    }
  }
  return map;
}

function resolveColumn(
  param: { f_code: string; column?: string },
  fCodeMap: Record<string, number>,
): number {
  const fCode = param.f_code.toLowerCase();
  if (fCodeMap[fCode] !== undefined) return fCodeMap[fCode];
  if (param.column) return columnIndexFromString(param.column);
  throw new Error(
    `Kolom untuk f-code "${param.f_code}" tidak ditemukan di header Excel.`,
  );
}

function resolveFCode(
  fCode: string,
  fCodeMap: Record<string, number>,
): number {
  const cleaned = fCode.trim().toLowerCase();
  if (fCodeMap[cleaned] !== undefined) return fCodeMap[cleaned];
  throw new Error(
    `Kolom untuk f-code "${fCode}" tidak ditemukan di header Excel.`,
  );
}

function readColumn(
  sheet: XLSX.WorkSheet,
  colIndex: number,
  startRow: number,
  endRow: number,
): (string | number)[] {
  const values: (string | number)[] = [];
  for (let row = startRow; row <= endRow; row++) {
    const addr = XLSX.utils.encode_cell({ r: row - 1, c: colIndex - 1 });
    const cell = sheet[addr];
    if (cell && cell.v != null && cell.v !== "") {
      values.push(cell.v);
    }
  }
  return values;
}

function findSheet(workbook: XLSX.WorkBook): XLSX.WorkSheet {
  const exact = workbook.Sheets[EXCEL_CONFIG.sheet_name];
  if (exact) return exact;

  const target = EXCEL_CONFIG.sheet_name.toLowerCase();
  for (const name of workbook.SheetNames) {
    if (name.toLowerCase().includes(target) || name.toLowerCase().includes("tracer")) {
      return workbook.Sheets[name];
    }
  }

  return workbook.Sheets[workbook.SheetNames[0]];
}

export function readExcel(buffer: Buffer): RawData {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = findSheet(workbook);

  if (!sheet) {
    const available = workbook.SheetNames.join(", ");
    throw new Error(
      `Sheet tidak ditemukan. Sheet tersedia: ${available}`,
    );
  }

  const fCodeMap = buildFCodeMap(sheet, EXCEL_CONFIG.header_row);
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  const highestRow = range.e.r + 1;
  const dataStartRow = EXCEL_CONFIG.data_start_row;

  const result: RawData = {};

  for (const [key, param] of Object.entries(PARAMETERS)) {
    if (key === "kemampuan_diri" && param.competencies) {
      const compResult: Record<string, CompetencyRawData> = {};
      for (const [compKey, comp] of Object.entries(param.competencies)) {
        const colA = resolveFCode(comp.column_a, fCodeMap);
        const colB = resolveFCode(comp.column_b, fCodeMap);
        compResult[compKey] = {
          name: comp.name,
          values_a: readColumn(sheet, colA, dataStartRow, highestRow),
          values_b: readColumn(sheet, colB, dataStartRow, highestRow),
        };
      }
      result[key] = compResult;
    } else {
      const columnIndex = resolveColumn(param, fCodeMap);
      result[key] = readColumn(sheet, columnIndex, dataStartRow, highestRow);
    }
  }

  return result;
}
