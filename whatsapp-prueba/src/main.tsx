import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppWithRoles from '@/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithRoles />
  </StrictMode>
)
