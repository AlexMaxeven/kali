import { Routes, Route, Link, useLocation } from 'react-router-dom'
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

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            🔒 Kali Security Lab
          </Link>
          <div className="nav-links">
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
              className="language-toggle"
              title={language === 'en' ? 'Перемкнути на українську' : 'Switch to English'}
            >
              {language === 'en' ? '🇺🇦' : '🇬🇧'}
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/xss" element={<XssLab />} />
          <Route path="/csrf" element={<CsrfLab />} />
          <Route path="/headers" element={<Headers />} />
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
