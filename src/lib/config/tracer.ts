export type InstrumentVersion = "v1" | "v2";

export interface CompetencyConfig {
  name: string;
  column_a: string;
  column_b: string;
  /** Hanya ada di instrumen tertentu; dilewati jika kolomnya tidak ada. */
  versions?: InstrumentVersion[];
}

export interface ParameterConfig {
  order: number;
  name: string;
  column?: string;
  f_code: string;
  statistic_type:
    | "frequency"
    | "mean_median"
    | "mean"
    | "sum"
    | "display"
    | "index";
  chart_type: "pie" | "bar" | "grouped_bar" | null;
  categories?: Record<number, string>;
  category_ranges?: Record<number, [number, number | null]>;
  competencies?: Record<string, CompetencyConfig>;
  likert_scale?: number[];
  group: string;
  /**
   * Instrumen v2: hanya baris dengan nilai F8 ini yang dihitung (mis. [1, 3] = bekerja & wirausaha),
   * karena satu kode dipakai di beberapa cabang dengan arti berbeda. File v1 tidak difilter.
   */
  f8_filter?: number[];
  /** Parameter hanya dihitung untuk versi instrumen ini; default semua versi. */
  versions?: InstrumentVersion[];
  /** Override khusus instrumen v2 (Panduan Form periode 2027). */
  v2?: Partial<Pick<ParameterConfig, "name" | "f_code" | "categories">>;
}

export const EXCEL_CONFIG = {
  sheet_name: "data tracer",
  // Posisi baku template DIKTI; dipakai bila baris header f-code tidak terdeteksi otomatis.
  header_row: 4,
  data_start_row: 5,
  // Baris header dicari otomatis di rentang ini: baris pertama yang memuat kolom "f8".
  header_scan_rows: 15,
  status_code: "f8",
};

/**
 * Kolom yang hanya ada di instrumen v2 (Panduan Form Tracer Study periode 2027).
 * File dianggap v2 bila header memuat salah satunya.
 */
export const V2_MARKER_CODES = ["f5a0", "f5e", "f1775", "f1777", "f1779", "f1781", "f28", "f37"];

export const PARAMETERS: Record<string, ParameterConfig> = {
  status_setelah_lulus: {
    order: 1,
    name: "Status Setelah Lulus",
    column: "M",
    f_code: "f8",
    statistic_type: "frequency",
    chart_type: "pie",
    categories: {
      1: "Bekerja",
      2: "Belum Memungkinkan Bekerja",
      3: "Wirausaha",
      4: "Studi Lanjut",
      5: "Mencari Kerja",
    },
    group: "status_alumni",
  },
  lama_mendapatkan_pekerjaan: {
    order: 2,
    name: "Lama Mendapatkan Pekerjaan",
    column: "BX",
    f_code: "f502",
    statistic_type: "frequency",
    chart_type: "bar",
    // F502 berisi jumlah bulan (0 = sudah bekerja sebelum lulus), dikelompokkan per rentang.
    categories: {
      1: "Kurang dari 6 bulan",
      2: "6–12 bulan",
      3: "Lebih dari 12 bulan",
    },
    category_ranges: {
      1: [0, 5],
      2: [6, 12],
      3: [13, null],
    },
    f8_filter: [1, 3],
    group: "bekerja",
  },
  tingkat_tempat_kerja: {
    order: 3,
    name: "Tingkat Tempat Kerja",
    column: "BI",
    f_code: "f5d",
    statistic_type: "frequency",
    chart_type: "bar",
    categories: {
      1: "Lokal",
      2: "Nasional",
      3: "Multinasional",
    },
    f8_filter: [1, 3],
    group: "bekerja",
  },
  bidang_kerja_lulusan: {
    order: 4,
    name: "Bidang Kerja Lulusan",
    column: "T",
    f_code: "f1101",
    statistic_type: "frequency",
    chart_type: "bar",
    categories: {
      1: "Pemerintah",
      2: "Non-profit",
      3: "Swasta",
      4: "Wiraswasta",
      5: "Lainnya",
      6: "BUMN",
      7: "Multilateral",
    },
    f8_filter: [1],
    group: "bekerja",
    // Kode 4 (wiraswasta) dihapus di v2; wirausaha kini F8 = 3.
    v2: {
      categories: {
        1: "Pemerintah",
        2: "Non-profit",
        3: "Swasta",
        5: "Lainnya",
        6: "BUMN/BUMD",
        7: "Multilateral",
      },
    },
  },
  kesesuaian_bidang_studi: {
    order: 5,
    name: "Kesesuaian Bidang Studi",
    column: "BC",
    f_code: "f14",
    statistic_type: "frequency",
    chart_type: "bar",
    categories: {
      1: "Sangat Erat",
      2: "Erat",
      3: "Cukup Erat",
      4: "Kurang Erat",
      5: "Tidak Sama Sekali",
    },
    // Di v2, F14 cabang studi lanjut (F8 = 4) bermakna lain, jadi hanya bekerja & wirausaha.
    f8_filter: [1, 3],
    group: "bekerja",
    v2: {
      categories: {
        1: "Sangat Relevan",
        2: "Relevan",
        3: "Cukup Relevan",
        4: "Kurang Relevan",
        5: "Tidak Relevan",
      },
    },
  },
  tingkat_pendidikan_pekerjaan: {
    order: 6,
    name: "Tingkat Pendidikan pada Pekerjaan",
    column: "AM",
    f_code: "f15",
    statistic_type: "frequency",
    chart_type: "bar",
    categories: {
      1: "Lebih Tinggi",
      2: "Sama",
      3: "Lebih Rendah",
      4: "Tidak Perlu PT",
    },
    f8_filter: [1, 3],
    group: "bekerja",
  },
  pendapatan_pertama: {
    order: 7,
    name: "Pendapatan Pertama Lulusan",
    column: "BP",
    f_code: "f505",
    statistic_type: "mean_median",
    chart_type: null,
    f8_filter: [1, 3],
    group: "bekerja",
  },
  penghasilan_lulusan: {
    order: 8,
    name: "Penghasilan Lulusan",
    column: "BP",
    f_code: "f505",
    statistic_type: "frequency",
    chart_type: "bar",
    categories: {
      1: "Kurang dari 1 juta",
      2: "1–3 juta",
      3: "3–5 juta",
      4: "Lebih dari 5 juta",
    },
    category_ranges: {
      1: [0, 999999],
      2: [1000000, 3000000],
      3: [3000001, 5000000],
      4: [5000001, null],
    },
    f8_filter: [1, 3],
    group: "bekerja",
  },
  mulai_mencari_pekerjaan: {
    order: 9,
    name: "Mulai Mencari Pekerjaan",
    column: "AY",
    f_code: "f301",
    // F301 adalah kategori (sebelum/sesudah lulus/tidak mencari), bukan jumlah bulan.
    statistic_type: "frequency",
    chart_type: "bar",
    categories: {
      1: "Sebelum lulus",
      2: "Sesudah lulus",
      3: "Tidak mencari kerja",
    },
    // Di cabang wirausaha, F301 berarti waktu memulai usaha.
    f8_filter: [1, 5],
    group: "mencari_kerja",
  },
  melamar_pekerjaan: {
    order: 10,
    name: "Melamar Pekerjaan",
    column: "CG",
    f_code: "f6",
    statistic_type: "sum",
    chart_type: null,
    f8_filter: [1, 5],
    group: "mencari_kerja",
  },
  diundang_wawancara: {
    order: 11,
    name: "Diundang Wawancara",
    column: "BD",
    f_code: "f7a",
    statistic_type: "sum",
    chart_type: null,
    f8_filter: [1, 5],
    group: "mencari_kerja",
  },
  tempat_pekerjaan: {
    order: 12,
    name: "Tempat Pekerjaan",
    column: "X",
    f_code: "f1101_5",
    statistic_type: "display",
    chart_type: null,
    f8_filter: [1],
    group: "bekerja",
    // v2 menyimpan nama perusahaan di F5B.
    v2: { f_code: "f5b" },
  },
  tempat_pendidikan_lanjut: {
    order: 13,
    name: "Tempat Melanjutkan Pendidikan",
    column: "AK",
    f_code: "f18c",
    statistic_type: "display",
    chart_type: null,
    f8_filter: [4],
    group: "studi_lanjut",
  },
  kemampuan_diri: {
    order: 14,
    name: "Penilaian Kemampuan Diri",
    f_code: "f1761-f1774",
    statistic_type: "index",
    chart_type: "grouped_bar",
    competencies: {
      etika: { name: "Etika", column_a: "f1761", column_b: "f1762" },
      keahlian_bidang: {
        name: "Keahlian Berdasarkan Bidang Ilmu",
        column_a: "f1763",
        column_b: "f1764",
      },
      bahasa_inggris: {
        name: "Kemampuan Bahasa Inggris",
        column_a: "f1765",
        column_b: "f1766",
      },
      teknologi_informasi: {
        name: "Penggunaan Teknologi Informasi",
        column_a: "f1767",
        column_b: "f1768",
      },
      komunikasi: {
        name: "Kemampuan Berkomunikasi",
        column_a: "f1769",
        column_b: "f1770",
      },
      kerjasama: {
        name: "Kemampuan Kerjasama Tim",
        column_a: "f1771",
        column_b: "f1772",
      },
      pengembangan_diri: {
        name: "Kemampuan Pengembangan Diri",
        column_a: "f1773",
        column_b: "f1774",
      },
      berpikir_kritis: {
        name: "Berpikir Kritis",
        column_a: "f1775",
        column_b: "f1776",
        versions: ["v2"],
      },
      kreativitas: {
        name: "Kreativitas",
        column_a: "f1777",
        column_b: "f1778",
        versions: ["v2"],
      },
      kewirausahaan: {
        name: "Kewirausahaan",
        column_a: "f1779",
        column_b: "f1780",
        versions: ["v2"],
      },
      adaptasi: {
        name: "Adaptasi",
        column_a: "f1781",
        column_b: "f1782",
        versions: ["v2"],
      },
    },
    likert_scale: [1, 2, 3, 4, 5],
    group: "kompetensi",
    v2: { f_code: "f1761-f1782" },
  },
  wirausaha_berizin: {
    order: 15,
    name: "Legalitas Usaha Lulusan Wirausaha",
    f_code: "f5e",
    statistic_type: "frequency",
    chart_type: "pie",
    categories: {
      1: "Sudah berizin/terdaftar",
      0: "Belum berizin/terdaftar",
    },
    f8_filter: [3],
    versions: ["v2"],
    group: "wirausaha",
  },

  /* ---- Item internal (kode H) — opsional, dihitung bila kolomnya ada ---- */
  bekerja_sebelum_lulus: {
    order: 16,
    name: "Bekerja/Berwirausaha Sebelum Lulus",
    f_code: "h1",
    statistic_type: "frequency",
    chart_type: "pie",
    categories: {
      1: "Ya",
      0: "Tidak",
    },
    f8_filter: [1, 3],
    group: "internal",
  },
  pengaruh_perkuliahan: {
    order: 17,
    name: "Pengaruh Positif Perkuliahan terhadap Pekerjaan/Wirausaha",
    f_code: "h2",
    statistic_type: "frequency",
    chart_type: "bar",
    categories: {
      5: "Sangat setuju",
      4: "Setuju",
      3: "Netral",
      2: "Tidak setuju",
      1: "Sangat tidak setuju",
    },
    f8_filter: [1, 3],
    group: "internal",
  },
  keaktifan_ormas: {
    order: 18,
    name: "Keaktifan di Ormas Keagamaan",
    f_code: "h3",
    statistic_type: "frequency",
    chart_type: "bar",
    categories: {
      1: "Muhammadiyah",
      2: "Nahdlatul Ulama (NU)",
      3: "Persatuan Islam (Persis)",
      4: "Ormas keagamaan lainnya",
      0: "Tidak aktif",
    },
    group: "internal",
  },
};

/** Parameter yang selalu wajib ada kolomnya; parameter lain dilewati bila kolomnya tidak ditemukan. */
export const REQUIRED_PARAMETERS = new Set([
  "status_setelah_lulus",
  "lama_mendapatkan_pekerjaan",
  "tingkat_tempat_kerja",
  "bidang_kerja_lulusan",
  "kesesuaian_bidang_studi",
  "tingkat_pendidikan_pekerjaan",
  "pendapatan_pertama",
  "penghasilan_lulusan",
  "mulai_mencari_pekerjaan",
  "melamar_pekerjaan",
  "diundang_wawancara",
  "kemampuan_diri",
]);

/** Konfigurasi parameter setelah override versi instrumen diterapkan. */
export function resolveParameter(
  config: ParameterConfig,
  version: InstrumentVersion,
): ParameterConfig {
  if (version !== "v2" || !config.v2) return config;
  return { ...config, ...config.v2 };
}

export function appliesToVersion(
  item: { versions?: InstrumentVersion[] },
  version: InstrumentVersion,
): boolean {
  return !item.versions || item.versions.includes(version);
}
