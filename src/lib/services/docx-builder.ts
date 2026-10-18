import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  ShadingType,
  LevelFormat,
  PageBreak,
} from "docx";

/* eslint-disable @typescript-eslint/no-explicit-any */

const FONT = "Times New Roman";
const COLOR_PRIMARY = "1F4E79";
const COLOR_HEADER_BG = "D6E4F0";
const COLOR_FOOTER_BG = "F2F2F2";

interface CellDef {
  text: string;
  bold?: boolean;
  size?: number;
  bg?: string;
  align?: "left" | "center" | "right";
  color?: string;
}

interface RowDef {
  cells: CellDef[];
}

export class DocxBuilder {
  private children: any[] = [];

  addPageBreak(): this {
    this.children.push(
      new Paragraph({ children: [new PageBreak()] }),
    );
    return this;
  }

  addTextBreak(count = 1): this {
    for (let i = 0; i < count; i++) {
      this.children.push(new Paragraph({ spacing: { after: 0 } }));
    }
    return this;
  }

  addText(
    text: string,
    fontOpts: {
      bold?: boolean;
      italic?: boolean;
      size?: number;
      color?: string;
    } = {},
    paraOpts: {
      alignment?: "left" | "center" | "right" | "both";
      spaceAfter?: number;
    } = {},
  ): this {
    const alignMap: Record<string, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
      left: AlignmentType.LEFT,
      center: AlignmentType.CENTER,
      right: AlignmentType.RIGHT,
      both: AlignmentType.JUSTIFIED,
    };

    this.children.push(
      new Paragraph({
        alignment: alignMap[paraOpts.alignment ?? "left"],
        spacing: { after: paraOpts.spaceAfter ?? 200 },
        children: [
          new TextRun({
            text,
            font: FONT,
            bold: fontOpts.bold,
            italics: fontOpts.italic,
            size: (fontOpts.size ?? 12) * 2,
            color: fontOpts.color,
          }),
        ],
      }),
    );
    return this;
  }

  addTitle(text: string, level: 1 | 2 = 1): this {
    this.children.push(
      new Paragraph({
        heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
        spacing: {
          before: level === 1 ? 0 : 240,
          after: level === 1 ? 120 : 80,
        },
        children: [
          new TextRun({
            text,
            font: FONT,
            bold: true,
            size: level === 1 ? 32 : 26,
            color: COLOR_PRIMARY,
          }),
        ],
      }),
    );
    return this;
  }

  addListItem(text: string, fontSize = 11): this {
    this.children.push(
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [
          new TextRun({ text, font: FONT, size: fontSize * 2 }),
        ],
      }),
    );
    return this;
  }

  addTable(rows: RowDef[], colWidths: number[] = []): this {
    const borderStyle = {
      style: BorderStyle.SINGLE,
      size: 1,
      color: "CCCCCC",
    };

    const tableRows = rows.map(
      (row) =>
        new TableRow({
          children: row.cells.map((cell, ci) => {
            const alignMap: Record<string, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
              left: AlignmentType.LEFT,
              center: AlignmentType.CENTER,
              right: AlignmentType.RIGHT,
            };

            return new TableCell({
              width: {
                size: colWidths[ci] ?? 3000,
                type: WidthType.DXA,
              },
              shading: cell.bg
                ? {
                    type: ShadingType.CLEAR,
                    fill: cell.bg,
                  }
                : undefined,
              children: [
                new Paragraph({
                  alignment: alignMap[cell.align ?? "left"],
                  children: [
                    new TextRun({
                      text: cell.text ?? "",
                      font: FONT,
                      bold: cell.bold,
                      size: (cell.size ?? 11) * 2,
                      color: cell.color,
                    }),
                  ],
                }),
              ],
            });
          }),
        }),
    );

    this.children.push(
      new Table({
        rows: tableRows,
        width: {
          size: colWidths.reduce((s, w) => s + w, 0) || 9000,
          type: WidthType.DXA,
        },
        borders: {
          top: borderStyle,
          bottom: borderStyle,
          left: borderStyle,
          right: borderStyle,
          insideHorizontal: borderStyle,
          insideVertical: borderStyle,
        },
      }),
    );
    return this;
  }

  async build(): Promise<Buffer> {
    const doc = new Document({
      numbering: {
        config: [
          {
            reference: "bullet-list",
            levels: [
              {
                level: 0,
                format: LevelFormat.BULLET,
                text: "•",
                alignment: AlignmentType.LEFT,
                style: {
                  paragraph: {
                    indent: { left: 720, hanging: 360 },
                  },
                },
              },
            ],
          },
        ],
      },
      styles: {
        default: {
          document: {
            run: {
              font: FONT,
              size: 24,
            },
            paragraph: {
              spacing: { after: 200, line: 276 },
            },
          },
          heading1: {
            run: {
              font: FONT,
              bold: true,
              color: COLOR_PRIMARY,
              size: 32,
            },
            paragraph: {
              spacing: { before: 0, after: 120 },
            },
          },
          heading2: {
            run: {
              font: FONT,
              bold: true,
              color: COLOR_PRIMARY,
              size: 26,
            },
            paragraph: {
              spacing: { before: 240, after: 80 },
            },
          },
        },
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: this.children,
        },
      ],
    });

    return Buffer.from(await Packer.toBuffer(doc));
  }
}

export function buildReport(
  tracerStudy: any,
  results: any[],
): DocxBuilder {
  const doc = new DocxBuilder();

  // Cover page
  doc.addTextBreak(4);
  doc.addText(
    "LAPORAN HASIL TRACER STUDY",
    { bold: true, size: 20, color: COLOR_PRIMARY },
    { alignment: "center", spaceAfter: 200 },
  );
  doc.addText(
    `${tracerStudy.namaProdi} (${tracerStudy.jenjang})`,
    { bold: true, size: 16 },
    { alignment: "center", spaceAfter: 120 },
  );
  doc.addText(
    tracerStudy.namaInstitusi,
    { size: 14 },
    { alignment: "center", spaceAfter: 400 },
  );
  doc.addText(
    `Tahun Lulusan: ${tracerStudy.tahunLulusan}`,
    { size: 13 },
    { alignment: "center", spaceAfter: 60 },
  );
  doc.addText(
    `Tahun Pelaksanaan Tracer: ${tracerStudy.tahunTracer}`,
    { size: 13 },
    { alignment: "center", spaceAfter: 400 },
  );
  doc.addText(
    "Dibuat secara otomatis oleh Sistem Tracer Reporting",
    { size: 10, italic: true, color: "666666" },
    { alignment: "center" },
  );

  doc.addPageBreak();

  // Summary
  doc.addTitle("Ringkasan", 1);

  const summaryData = [
    ["Nama Institusi", tracerStudy.namaInstitusi],
    ["Program Studi", tracerStudy.namaProdi],
    ["Jenjang", tracerStudy.jenjang],
    ["Tahun Lulusan", String(tracerStudy.tahunLulusan)],
    ["Tahun Tracer", String(tracerStudy.tahunTracer)],
    ["Total Lulusan", Number(tracerStudy.totalLulusan).toLocaleString("id-ID")],
    [
      "Total Responden",
      Number(tracerStudy.totalResponden).toLocaleString("id-ID"),
    ],
    ["Response Rate", `${Number(tracerStudy.responseRate).toFixed(2)}%`],
  ];

  doc.addTable(
    summaryData.map(([label, value]) => ({
      cells: [
        { text: label, bold: true, size: 11, bg: COLOR_HEADER_BG },
        { text: value, size: 11 },
      ],
    })),
    [3000, 6000],
  );

  doc.addTextBreak(1);

  // Parameter sections
  for (const result of results) {
    const data =
      typeof result.resultData === "string"
        ? JSON.parse(result.resultData)
        : result.resultData;

    doc.addTitle(`${result.order}. ${result.parameterName}`, 2);
    if (result.narrative) {
      doc.addText(result.narrative, { size: 12 }, { spaceAfter: 120 });
    }

    switch (result.statisticType) {
      case "frequency":
        addFrequencyTable(doc, data);
        break;
      case "mean_median":
        addMeanMedianTable(doc, data);
        break;
      case "mean":
        addMeanTable(doc, data);
        break;
      case "sum":
        addSumTable(doc, data);
        break;
      case "display":
        addDisplayList(doc, data);
        break;
      case "index":
        addIndexTable(doc, data);
        break;
    }
    doc.addTextBreak(1);
  }

  // Footer
  doc.addTextBreak(2);
  doc.addText(
    "Laporan ini dihasilkan secara otomatis oleh Sistem Web Tracer Reporting.",
    { italic: true, size: 10, color: "999999" },
    { alignment: "center" },
  );

  return doc;
}

function fmt(n: number): string {
  return n.toLocaleString("id-ID");
}

function addFrequencyTable(doc: DocxBuilder, data: any): void {
  const rows: RowDef[] = [
    {
      cells: [
        { text: "Kategori", bold: true, size: 11, bg: COLOR_HEADER_BG },
        {
          text: "Jumlah",
          bold: true,
          size: 11,
          bg: COLOR_HEADER_BG,
          align: "right",
        },
        {
          text: "Persentase",
          bold: true,
          size: 11,
          bg: COLOR_HEADER_BG,
          align: "right",
        },
      ],
    },
  ];

  for (const freq of data.frequencies ?? []) {
    rows.push({
      cells: [
        { text: freq.label, size: 11 },
        { text: String(freq.count), size: 11, align: "right" },
        {
          text: `${Number(freq.percentage).toFixed(1)}%`,
          size: 11,
          align: "right",
        },
      ],
    });
  }

  rows.push({
    cells: [
      { text: "Total", bold: true, size: 11, bg: COLOR_FOOTER_BG },
      {
        text: String(data.total),
        bold: true,
        size: 11,
        bg: COLOR_FOOTER_BG,
        align: "right",
      },
      {
        text: "100%",
        bold: true,
        size: 11,
        bg: COLOR_FOOTER_BG,
        align: "right",
      },
    ],
  });

  doc.addTable(rows, [4500, 2000, 2500]);
}

function addMeanMedianTable(doc: DocxBuilder, data: any): void {
  const items = [
    ["Rata-rata (Mean)", `Rp ${fmt(data.mean)}`],
    ["Median", `Rp ${fmt(data.median)}`],
    ["Minimum", `Rp ${fmt(data.min)}`],
    ["Maksimum", `Rp ${fmt(data.max)}`],
    ["Jumlah Data", String(data.count)],
  ];

  doc.addTable(
    items.map(([label, value]) => ({
      cells: [
        { text: label, bold: true, size: 11, bg: COLOR_HEADER_BG },
        { text: value, size: 11, align: "right" as const },
      ],
    })),
    [4500, 4500],
  );
}

function addMeanTable(doc: DocxBuilder, data: any): void {
  doc.addTable(
    [
      {
        cells: [
          { text: "Rata-rata", bold: true, size: 11, bg: COLOR_HEADER_BG },
          {
            text: `${data.mean} bulan`,
            size: 11,
            align: "right" as const,
          },
        ],
      },
      {
        cells: [
          { text: "Jumlah Data", bold: true, size: 11, bg: COLOR_HEADER_BG },
          {
            text: String(data.count),
            size: 11,
            align: "right" as const,
          },
        ],
      },
    ],
    [4500, 4500],
  );
}

function addSumTable(doc: DocxBuilder, data: any): void {
  doc.addTable(
    [
      {
        cells: [
          { text: "Total", bold: true, size: 11, bg: COLOR_HEADER_BG },
          {
            text: fmt(data.total_sum),
            size: 11,
            align: "right" as const,
          },
        ],
      },
      {
        cells: [
          { text: "Rata-rata", bold: true, size: 11, bg: COLOR_HEADER_BG },
          {
            text: Number(data.mean).toFixed(1),
            size: 11,
            align: "right" as const,
          },
        ],
      },
      {
        cells: [
          { text: "Jumlah Data", bold: true, size: 11, bg: COLOR_HEADER_BG },
          {
            text: String(data.count),
            size: 11,
            align: "right" as const,
          },
        ],
      },
    ],
    [4500, 4500],
  );
}

function addDisplayList(doc: DocxBuilder, data: any): void {
  if (!data.values || data.values.length === 0) {
    doc.addText("Tidak ada data.", { italic: true, size: 11 });
    return;
  }
  for (const value of data.values) {
    doc.addListItem(value, 11);
  }
  doc.addText(
    `Total: ${data.count} data`,
    { italic: true, size: 10, color: "666666" },
    { spaceAfter: 60 },
  );
}

function addIndexTable(doc: DocxBuilder, data: any): void {
  const rows: RowDef[] = [
    {
      cells: [
        { text: "Kompetensi", bold: true, size: 11, bg: COLOR_HEADER_BG },
        {
          text: "Dikuasai",
          bold: true,
          size: 11,
          bg: COLOR_HEADER_BG,
          align: "right",
        },
        {
          text: "Dibutuhkan",
          bold: true,
          size: 11,
          bg: COLOR_HEADER_BG,
          align: "right",
        },
        {
          text: "Gap",
          bold: true,
          size: 11,
          bg: COLOR_HEADER_BG,
          align: "right",
        },
      ],
    },
  ];

  for (const comp of Object.values(data.competencies ?? {}) as any[]) {
    rows.push({
      cells: [
        { text: comp.name, size: 11 },
        {
          text: Number(comp.index_a).toFixed(2),
          size: 11,
          align: "right",
        },
        {
          text: Number(comp.index_b).toFixed(2),
          size: 11,
          align: "right",
        },
        {
          text: Number(comp.gap).toFixed(2),
          size: 11,
          align: "right",
          color: comp.gap < 0 ? "CC0000" : "008800",
        },
      ],
    });
  }

  doc.addTable(rows, [3500, 1800, 1800, 1900]);
}
