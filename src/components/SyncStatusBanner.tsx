import { useTaskStore } from '../store/TaskStore'

export function SyncStatusBanner() {
  const { loadError, saveError, retryLoad, retrySave } = useTaskStore()

  if (!loadError && !saveError) return null

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-rose-500 px-4 py-2 text-xs text-white">
      <span>{loadError ? '数据加载失败，可能是网络问题' : '保存失败，改动可能没有同步上去'}</span>
      <button onClick={loadError ? retryLoad : retrySave} className="shrink-0 rounded-full bg-white/20 px-2 py-1 font-medium">
        重试
      </button>
    </div>
  )
}
