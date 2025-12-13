import CodeBlock from '../components/CodeBlock'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../utils/translations'
import './Headers.css'

function Headers() {
  const { language } = useLanguage()
  const t = (key) => getTranslation(key, language)

  return (
    <div className="headers-lab">
      <div className="lab-header">
        <h1>🟢 {t('headers.title')}</h1>
        <p className="lab-description">
          {t('headers.description')}
        </p>
      </div>

      <div className="headers-grid">
        <div className="header-card">
          <div className="header-icon">🛡️</div>
          <h2>{t('headers.cspTitle')}</h2>
          <p className="header-description">
            {t('headers.cspDesc')}
          </p>
          
          <div className="header-example">
            <h3>{language === 'en' ? 'Example Header:' : 'Приклад заголовка:'}</h3>
            <CodeBlock language="http">
{`Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self'`}
            </CodeBlock>
          </div>

          <div className="header-explanation">
            <h3>{language === 'en' ? 'Why It Matters:' : 'Чому це важливо:'}</h3>
            <ul>
              <li>
                <strong>{language === 'en' ? 'Prevents XSS:' : 'Запобігає XSS:'}</strong> {t('headers.cspWhy1')}
              </li>
              <li>
                <strong>{language === 'en' ? 'Controls resource loading:' : 'Контролює завантаження ресурсів:'}</strong> {t('headers.cspWhy2')}
              </li>
              <li>
                <strong>{language === 'en' ? 'Reduces attack surface:' : 'Зменшує поверхню атаки:'}</strong> {t('headers.cspWhy3')}
              </li>
              <li>
                <strong>{language === 'en' ? 'Report violations:' : 'Повідомлення про порушення:'}</strong> {t('headers.cspWhy4')}
              </li>
            </ul>
          </div>

          <div className="header-tradeoff">
            <strong>⚠️ {language === 'en' ? 'Trade-off:' : 'Компроміс:'}</strong> {t('headers.cspTradeoff')}
          </div>
        </div>

        <div className="header-card">
          <div className="header-icon">🚫</div>
          <h2>{t('headers.frameTitle')}</h2>
          <p className="header-description">
            {t('headers.frameDesc')}
          </p>
          
          <div className="header-example">
            <h3>{language === 'en' ? 'Example Header:' : 'Приклад заголовка:'}</h3>
            <CodeBlock language="http">
{`X-Frame-Options: DENY
# or
X-Frame-Options: SAMEORIGIN`}
            </CodeBlock>
          </div>

          <div className="header-explanation">
            <h3>{language === 'en' ? 'Why It Matters:' : 'Чому це важливо:'}</h3>
            <ul>
              <li>
                <strong>{language === 'en' ? 'Prevents clickjacking:' : 'Запобігає clickjacking:'}</strong> {t('headers.frameWhy1')}
              </li>
              <li>
                <strong>DENY:</strong> {t('headers.frameWhy2')}
              </li>
              <li>
                <strong>SAMEORIGIN:</strong> {t('headers.frameWhy3')}
              </li>
              <li>
                <strong>{language === 'en' ? 'Modern alternative:' : 'Сучасна альтернатива:'}</strong> {t('headers.frameWhy4')}
              </li>
            </ul>
          </div>

          <div className="header-tradeoff">
            <strong>💡 {language === 'en' ? 'Note:' : 'Примітка:'}</strong> {t('headers.frameNote')}
          </div>
        </div>

        <div className="header-card">
          <div className="header-icon">🍪</div>
          <h2>{t('headers.cookieTitle')}</h2>
          <p className="header-description">
            {t('headers.cookieDesc')}
          </p>
          
          <div className="header-example">
            <h3>{language === 'en' ? 'Example Cookie:' : 'Приклад Cookie:'}</h3>
            <CodeBlock language="http">
{`Set-Cookie: sessionId=abc123; 
  SameSite=Strict; 
  Secure; 
  HttpOnly`}
            </CodeBlock>
          </div>

          <div className="header-explanation">
            <h3>{language === 'en' ? 'Why It Matters:' : 'Чому це важливо:'}</h3>
            <ul>
              <li>
                <strong>Strict:</strong> {t('headers.cookieWhy1')}
              </li>
              <li>
                <strong>Lax:</strong> {t('headers.cookieWhy2')}
              </li>
              <li>
                <strong>None:</strong> {t('headers.cookieWhy3')}
              </li>
              <li>
                <strong>{language === 'en' ? 'Combined with Secure:' : 'У поєднанні з Secure:'}</strong> {t('headers.cookieWhy4')}
              </li>
              <li>
                <strong>HttpOnly:</strong> {t('headers.cookieWhy5')}
              </li>
            </ul>
          </div>

          <div className="header-tradeoff">
            <strong>⚠️ {language === 'en' ? 'Trade-off:' : 'Компроміс:'}</strong> {t('headers.cookieTradeoff')}
          </div>
        </div>

        <div className="header-card">
          <div className="header-icon">🔒</div>
          <h2>{t('headers.hstsTitle')}</h2>
          <p className="header-description">
            {t('headers.hstsDesc')}
          </p>
          
          <div className="header-example">
            <h3>{language === 'en' ? 'Example Header:' : 'Приклад заголовка:'}</h3>
            <CodeBlock language="http">
{`Strict-Transport-Security: 
  max-age=31536000; 
  includeSubDomains; 
  preload`}
            </CodeBlock>
          </div>

          <div className="header-explanation">
            <h3>{language === 'en' ? 'Why It Matters:' : 'Чому це важливо:'}</h3>
            <ul>
              <li>
                <strong>{language === 'en' ? 'Prevents downgrade attacks:' : 'Запобігає атакам downgrade:'}</strong> {t('headers.hstsWhy1')}
              </li>
              <li>
                <strong>max-age:</strong> {t('headers.hstsWhy2')}
              </li>
              <li>
                <strong>includeSubDomains:</strong> {t('headers.hstsWhy3')}
              </li>
              <li>
                <strong>preload:</strong> {t('headers.hstsWhy4')}
              </li>
            </ul>
          </div>
        </div>

        <div className="header-card">
          <div className="header-icon">🔍</div>
          <h2>{t('headers.contentTypeTitle')}</h2>
          <p className="header-description">
            {t('headers.contentTypeDesc')}
          </p>
          
          <div className="header-example">
            <h3>{language === 'en' ? 'Example Header:' : 'Приклад заголовка:'}</h3>
            <CodeBlock language="http">
{`X-Content-Type-Options: nosniff`}
            </CodeBlock>
          </div>

          <div className="header-explanation">
            <h3>{language === 'en' ? 'Why It Matters:' : 'Чому це важливо:'}</h3>
            <ul>
              <li>
                <strong>{language === 'en' ? 'Prevents MIME confusion attacks:' : 'Запобігає атакам MIME confusion:'}</strong> {t('headers.contentTypeWhy1')}
              </li>
              <li>
                <strong>{language === 'en' ? 'Simple but effective:' : 'Простий, але ефективний:'}</strong> {t('headers.contentTypeWhy2')}
              </li>
              <li>
                <strong>{language === 'en' ? 'Low risk:' : 'Низький ризик:'}</strong> {t('headers.contentTypeWhy3')}
              </li>
            </ul>
          </div>
        </div>

        <div className="header-card">
          <div className="header-icon">🚨</div>
          <h2>{t('headers.referrerTitle')}</h2>
          <p className="header-description">
            {t('headers.referrerDesc')}
          </p>
          
          <div className="header-example">
            <h3>{language === 'en' ? 'Example Header:' : 'Приклад заголовка:'}</h3>
            <CodeBlock language="http">
{`Referrer-Policy: strict-origin-when-cross-origin`}
            </CodeBlock>
          </div>

          <div className="header-explanation">
            <h3>{language === 'en' ? 'Why It Matters:' : 'Чому це важливо:'}</h3>
            <ul>
              <li>
                <strong>{language === 'en' ? 'Privacy protection:' : 'Захист приватності:'}</strong> {t('headers.referrerWhy1')}
              </li>
              <li>
                <strong>strict-origin-when-cross-origin:</strong> {t('headers.referrerWhy2')}
              </li>
              <li>
                <strong>{language === 'en' ? 'Prevents information leakage:' : 'Запобігає витоку інформації:'}</strong> {t('headers.referrerWhy3')}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="implementation-section">
        <h2>{t('headers.implementation')}</h2>
        <div className="implementation-card">
          <h3>Express.js Middleware</h3>
          <CodeBlock language="javascript">
{`const express = require('express')
const helmet = require('helmet')
const app = express()

// Use helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  frameguard: { action: 'deny' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}))

// Set cookies with SameSite
app.use((req, res, next) => {
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 3600000,
  })
  next()
})`}
          </CodeBlock>
        </div>
      </div>

      <div className="summary-section">
        <h2>📚 {t('headers.summary')}</h2>
        <div className="summary-content">
          <p>
            {t('headers.summaryText')}
          </p>
          <ul className="summary-list">
            <li><strong>CSP</strong> - {t('headers.summaryList1')}</li>
            <li><strong>X-Frame-Options</strong> - {t('headers.summaryList2')}</li>
            <li><strong>SameSite Cookies</strong> - {t('headers.summaryList3')}</li>
            <li><strong>HSTS</strong> - {t('headers.summaryList4')}</li>
            <li><strong>X-Content-Type-Options</strong> - {t('headers.summaryList5')}</li>
            <li><strong>Referrer-Policy</strong> - {t('headers.summaryList6')}</li>
          </ul>
          <p className="final-note">
            <strong>{language === 'en' ? 'Remember:' : 'Пам\'ятайте:'}</strong> {t('headers.finalNote')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Headers

