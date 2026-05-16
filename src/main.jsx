import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import LoginPage from './admin/LoginPage.jsx'
import AdminPanel from './admin/AdminPanel.jsx'
import PrivateRoute from './admin/PrivateRoute.jsx'
import SitePage from './pages/SitePage.jsx'
import EditPage from './pages/EditPage.jsx'
import ObrigadoPage from './pages/ObrigadoPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/biblico" element={<App variant="biblico" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
        <Route path="/edit/:phone" element={<EditPage />} />
        <Route path="/obrigado/:phone" element={<ObrigadoPage />} />
        <Route path="/:phone" element={<SitePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
