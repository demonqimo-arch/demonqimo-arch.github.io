import y2025 from '../data/holidays/2025.json'
import y2026 from '../data/holidays/2026.json'
import y2027 from '../data/holidays/2027.json'

interface HolidayDay {
  name: string
  date: string
  isOffDay: boolean
}

interface HolidayYearData {
  year: number
  days: HolidayDay[]
}

const YEARS = [y2025, y2026, y2027] as HolidayYearData[]

const HOLIDAY_MAP = new Map<string, HolidayDay>()
for (const yearData of YEARS) {
  for (const day of yearData.days) {
    HOLIDAY_MAP.set(day.date, day)
  }
}

export interface HolidayBadge {
  label: string
  isOffDay: boolean
}

/** 数据来自 https://github.com/NateScarlet/holiday-cn，官方节假日安排每年公布一次，需要每年补一份新的 JSON 才能覆盖新年份 */
export function getHolidayBadge(dateIso: string): HolidayBadge | null {
  const entry = HOLIDAY_MAP.get(dateIso)
  if (!entry) return null
  return {
    label: entry.isOffDay ? entry.name.slice(0, 2) : '班',
    isOffDay: entry.isOffDay,
  }
}
