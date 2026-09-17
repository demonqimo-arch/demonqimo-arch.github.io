import jan from '../assets/backgrounds/month-01-alice.png'
import feb from '../assets/backgrounds/month-02-peter.jpg'
import mar from '../assets/backgrounds/month-03-alice.png'
import apr from '../assets/backgrounds/month-04-peter.jpg'
import may from '../assets/backgrounds/month-05-alice.png'
import jun from '../assets/backgrounds/month-06-peter.jpg'
import jul from '../assets/backgrounds/month-07-alice.png'
import aug from '../assets/backgrounds/month-08-peter.jpg'
import sep from '../assets/backgrounds/month-09-peter.jpg'
import oct from '../assets/backgrounds/month-10-peter.jpg'
import nov from '../assets/backgrounds/month-11-alice.png'
import dec from '../assets/backgrounds/month-12-peter.jpg'

const MONTHLY_BACKGROUNDS = [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]

/** date.getMonth() 是 0-11，直接按当前真实月份取图，每个月自动换一张 */
export function getMonthlyBackground(date: Date): string {
  return MONTHLY_BACKGROUNDS[date.getMonth()]
}
