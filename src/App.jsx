import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useLanguage } from './contexts/LanguageContext'
import { getTranslation } from './utils/translations'
import Home from './pages/Home'
import XssLab from './pages/XssLab'
import CsrfLab from './pages/CsrfLab'
import Headers from './pages/Headers'
import './App.css'

function App() {
  const location = useLocation()
  const { language, toggleLanguage } = useLanguage()
  const t = (key) => getTranslation(key, language)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Скрол вгору при зміні сторінки
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  // Закриваємо меню при зміні сторінки
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // Блокуємо скрол body коли меню відкрите
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            🔒 Kali Security Lab
          </Link>
          <button 
            className="burger-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={isMenuOpen ? 'open' : ''}></span>
            <span className={isMenuOpen ? 'open' : ''}></span>
            <span className={isMenuOpen ? 'open' : ''}></span>
          </button>
        </div>
        {isMenuOpen && (
          <div 
            className="menu-overlay"
            onClick={() => setIsMenuOpen(false)}
          ></div>
        )}
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            {t('nav.home')}
          </Link>
          <Link 
            to="/xss" 
            className={location.pathname === '/xss' ? 'active' : ''}
          >
            {t('nav.xss')}
          </Link>
          <Link 
            to="/csrf" 
            className={location.pathname === '/csrf' ? 'active' : ''}
          >
            {t('nav.csrf')}
          </Link>
          <Link 
            to="/headers" 
            className={location.pathname === '/headers' ? 'active' : ''}
          >
            {t('nav.headers')}
          </Link>
          <button 
            onClick={toggleLanguage}
            className={`language-toggle ${language === 'uk' ? 'active-uk' : 'active-en'}`}
            title={language === 'en' ? 'Перемкнути на українську' : 'Switch to English'}
          >
            <span className={language === 'en' ? 'active' : ''}>🇬🇧</span>
            <span className={language === 'uk' ? 'active' : ''}>🇺🇦</span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/xss" element={<XssLab />} />
          <Route path="/csrf" element={<CsrfLab />} />
          <Route path="/headers" element={<Headers />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>
          ⚠️ <strong>{t('footer.disclaimer')}</strong> - {t('footer.note')}
        </p>
      </footer>
    </div>
  )
}

export default App
