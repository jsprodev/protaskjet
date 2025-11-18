import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { App } from './App.tsx'
import './index.css'
// import { AuthProvider } from './context/AuthContext.tsx'
// import { SignupPage } from './pages/SignupPage.tsx'
// import { LoginPage } from './pages/LoginPage.tsx'
// import { DashboardPage } from './pages/DashboardPage.tsx'
// import { SettingsPage } from './pages/SettingsPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
