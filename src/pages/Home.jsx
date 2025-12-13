import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../utils/translations'
import './Home.css'

function Home() {
  const { language } = useLanguage()
  const t = (key) => getTranslation(key, language)

  return (
    <div className="home">
      <div className="hero">
        <h1>🔒 {t('home.title')}</h1>
        <p className="subtitle">
          {t('home.subtitle')}
        </p>
      </div>

      <div className="labs-grid">
        <div className="lab-card">
          <div className="lab-icon">🔴</div>
          <h2>{t('home.xssTitle')}</h2>
          <p>
            {t('home.xssDesc')}
          </p>
          <ul className="lab-features">
            <li>{t('home.xssFeatures.unsafe')}</li>
            <li>{t('home.xssFeatures.safe')}</li>
            <li>{t('home.xssFeatures.payloads')}</li>
            <li>{t('home.xssFeatures.mitigation')}</li>
          </ul>
          <Link to="/xss" className="lab-button">
            {t('home.explore')} {t('home.xssTitle')} →
          </Link>
        </div>

        <div className="lab-card">
          <div className="lab-icon">🔵</div>
          <h2>{t('home.csrfTitle')}</h2>
          <p>
            {t('home.csrfDesc')}
          </p>
          <ul className="lab-features">
            <li>{t('home.csrfFeatures.login')}</li>
            <li>{t('home.csrfFeatures.cookies')}</li>
            <li>{t('home.csrfFeatures.tokens')}</li>
            <li>{t('home.csrfFeatures.scenarios')}</li>
          </ul>
          <Link to="/csrf" className="lab-button">
            {t('home.explore')} {t('home.csrfTitle')} →
          </Link>
        </div>

        <div className="lab-card">
          <div className="lab-icon">🟢</div>
          <h2>{t('home.headersTitle')}</h2>
          <p>
            {t('home.headersDesc')}
          </p>
          <ul className="lab-features">
            <li>{t('home.headersFeatures.csp')}</li>
            <li>{t('home.headersFeatures.frame')}</li>
            <li>{t('home.headersFeatures.samesite')}</li>
            <li>{t('home.headersFeatures.why')}</li>
          </ul>
          <Link to="/headers" className="lab-button">
            {t('home.explore')} {t('home.headersTitle')} →
          </Link>
        </div>
      </div>

      <div className="info-section">
        <h2>📚 {t('home.aboutTitle')}</h2>
        <div className="info-content">
          <p>
            {t('home.about1')}
          </p>
          <p>
            <strong>{language === 'en' ? 'Important:' : 'Важливо:'}</strong> {t('home.about2')}
          </p>
        </div>
      </div>

      <div className="kali-section">
        <h2>🐉 {t('home.kaliTitle')}</h2>
        <p>
          {t('home.kaliDesc')}
        </p>
        <ul className="kali-tools">
          <li><strong>Burp Suite</strong> - {t('home.kaliTools.burp')}</li>
          <li><strong>nmap</strong> - {t('home.kaliTools.nmap')}</li>
          <li><strong>Wireshark</strong> - {t('home.kaliTools.wireshark')}</li>
          <li><strong>dirsearch</strong> - {t('home.kaliTools.dirsearch')}</li>
        </ul>
        <p className="kali-note">
          {t('home.kaliNote')}
        </p>
      </div>
    </div>
  )
}

export default Home

