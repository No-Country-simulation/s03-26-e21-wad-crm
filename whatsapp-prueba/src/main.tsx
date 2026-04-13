import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
<<<<<<< HEAD
import './index.css'
import AppWithRoles from '@/App'
=======
import AppWithRoles from '@/App'
import './index.css'
>>>>>>> origin/feat/startup-crm/whatsapp

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithRoles />
  </StrictMode>
)
