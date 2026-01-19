import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App2.tsx'
import { BrowserRouter } from 'react-router-dom'
import { OntologyProvider } from './context/OntologyContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <OntologyProvider>
        <App />
      </OntologyProvider>
    </BrowserRouter>
  </StrictMode>
)
