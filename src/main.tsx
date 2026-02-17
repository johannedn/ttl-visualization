import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { OntologyProvider } from './context/OntologyContext.tsx'
import { PageProvider } from './context/PageContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PageProvider>
        <OntologyProvider>
          <App />
        </OntologyProvider>
      </PageProvider>
    </BrowserRouter>
  </StrictMode>
)
