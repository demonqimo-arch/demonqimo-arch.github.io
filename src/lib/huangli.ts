import { Solar } from 'lunar-javascript'

export interface HuangLiInfo {
  lunarDate: string
  yearGanZhi: string
  shengXiao: string
  jieQi: string | null
  festivals: string[]
  yi: string[]
  ji: string[]
}

export function getHuangLiInfo(date: Date): HuangLiInfo {
  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()
  const jieQi = lunar.getJieQi()

  return {
    lunarDate: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    yearGanZhi: lunar.getYearInGanZhi(),
    shengXiao: lunar.getYearShengXiao(),
    jieQi: jieQi ? jieQi : null,
    festivals: [...lunar.getFestivals(), ...lunar.getOtherFestivals()],
    yi: lunar.getDayYi(),
    ji: lunar.getDayJi(),
  }
}
