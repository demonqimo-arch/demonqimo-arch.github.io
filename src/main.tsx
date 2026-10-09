import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import { PinGate } from './auth/PinGate.tsx'
import './index.css'
import { TaskStoreProvider } from './store/TaskStore.tsx'

const queryClient = new QueryClient()

const updateSW = registerSW({ immediate: true })

// 手机上PWA经常只是被切到后台挂起、很少真正关闭重开，浏览器自己检查更新的时机不可控，
// 所以每次App重新回到前台时主动去问一下有没有新版本，发现更新就自动应用
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    updateSW()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PinGate>
        <TaskStoreProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TaskStoreProvider>
      </PinGate>
    </QueryClientProvider>
  </StrictMode>,
)
