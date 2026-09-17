import { getHuangLiInfo } from '../lib/huangli'

interface Props {
  date: Date
}

export function HuangLiCard({ date }: Props) {
  const info = getHuangLiInfo(date)
  const tags = [info.jieQi, ...info.festivals].filter((v): v is string => !!v)

  return (
    <div className="rounded-3xl bg-surface px-4 py-3.5 shadow-card">
      <div className="flex flex-wrap items-center gap-1.5">
        <p className="text-sm font-semibold text-ink">
          农历{info.yearGanZhi}年（{info.shengXiao}）{info.lunarDate}
        </p>
        {tags.map((tag) => (
          <span key={tag} className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-white">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
        <div className="flex gap-2">
          <span className="mt-0.5 h-fit shrink-0 rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            宜
          </span>
          <div className="flex flex-wrap gap-x-2.5 gap-y-1">
            {(info.yi.length > 0 ? info.yi : ['无']).map((item) => (
              <span key={item} className="whitespace-nowrap text-xs leading-relaxed text-ink">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <span className="mt-0.5 h-fit shrink-0 rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            忌
          </span>
          <div className="flex flex-wrap gap-x-2.5 gap-y-1">
            {(info.ji.length > 0 ? info.ji : ['无']).map((item) => (
              <span key={item} className="whitespace-nowrap text-xs leading-relaxed text-ink">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
