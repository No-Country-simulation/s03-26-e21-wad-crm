import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppWithRoles from '@/App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithRoles />
  </StrictMode>
)
