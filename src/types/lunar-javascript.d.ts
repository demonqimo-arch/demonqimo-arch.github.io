declare module 'lunar-javascript' {
  export interface Lunar {
    getMonthInChinese(): string
    getDayInChinese(): string
    getYearInGanZhi(): string
    getYearShengXiao(): string
    getJieQi(): string
    getFestivals(): string[]
    getOtherFestivals(): string[]
    getDayYi(): string[]
    getDayJi(): string[]
  }

  export interface Solar {
    getLunar(): Lunar
  }

  export const Solar: {
    fromDate(date: Date): Solar
  }
}
