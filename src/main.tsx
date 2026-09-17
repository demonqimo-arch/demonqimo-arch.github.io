import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { PinGate } from './auth/PinGate.tsx'
import './index.css'
import { TaskStoreProvider } from './store/TaskStore.tsx'

const queryClient = new QueryClient()

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
