import desktopBg from '../assets/backdrop/desktop.jpg'
import mobileBg from '../assets/backdrop/mobile.webp'

export function MonthlyBackdrop() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-canvas" aria-hidden="true">
      <img src={mobileBg} className="block h-full w-full object-cover opacity-[0.14] md:hidden" alt="" />
      <img src={desktopBg} className="hidden h-full w-full object-cover opacity-[0.14] md:block" alt="" />
      <div className="absolute inset-0 bg-canvas/60" />
    </div>
  )
}
