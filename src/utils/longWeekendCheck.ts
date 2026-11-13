/**
 * Official UNKLAB 2026 Long Weekend windows defined in the Academic Calendar:
 * 1. 2026-01-16 to 2026-01-18 (Isra Mikraj & Kepulangan Mahasiswa)
 * 2. 2026-04-03 to 2026-04-05 (Wafat Yesus Kristus & Paskah)
 * 3. 2026-08-15 to 2026-08-17 (HUT Kemerdekaan RI)
 */
export interface LongWeekendPeriod {
  startDate: string;
  endDate: string;
  name: string;
  description: string;
}

export const OFFICIAL_2026_LONG_WEEKENDS: LongWeekendPeriod[] = [
  {
    startDate: "2026-01-16",
    endDate: "2026-01-18",
    name: "Long Weekend Isra Mikraj & Awal Semester II",
    description: "Mahasiswa pulang setelah kelas hari Kamis 15 Januari. Ibadah Sabbath ditiadakan."
  },
  {
    startDate: "2026-04-03",
    endDate: "2026-04-05",
    name: "Long Weekend Paskah 2026",
    description: "Libur Wafat Yesus Kristus & Hari Paskah. Ibadah Sabbath ditiadakan."
  },
  {
    startDate: "2026-08-15",
    endDate: "2026-08-17",
    name: "Long Weekend HUT Kemerdekaan RI ke-81",
    description: "Mahasiswa pulang setelah kelas Jumat 14 Agustus. Ibadah Sabbath ditiadakan."
  }
];

export interface LongWeekendCheckResult {
  isLongWeekend: boolean;
  period?: LongWeekendPeriod;
  statusText: string;
}

export function checkDateAgainstLongWeekend(dateStr: string): LongWeekendCheckResult {
  if (!dateStr) {
    return {
      isLongWeekend: false,
      statusText: "Tanggal tidak valid"
    };
  }

  for (const period of OFFICIAL_2026_LONG_WEEKENDS) {
    if (dateStr >= period.startDate && dateStr <= period.endDate) {
      return {
        isLongWeekend: true,
        period,
        statusText: `Termasuk dalam ${period.name} (${period.startDate} s/d ${period.endDate}). Ibadah Sabbath ditiadakan.`
      };
    }
  }

  return {
    isLongWeekend: false,
    statusText: "Bukan long weekend. Terverifikasi bebas konflik kalender akademik."
  };
}
