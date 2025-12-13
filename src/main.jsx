import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
    <App />
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
