import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../utils/translations'
import CodeBlock from '../components/CodeBlock'
import './CsrfLab.css'

function CsrfLab() {
  const { language } = useLanguage()
  const t = (key) => getTranslation(key, language)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  const [lastAction, setLastAction] = useState('')
  const [actionHistory, setActionHistory] = useState([])

  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/csrf-token', {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => setCsrfToken(data.token))
        .catch(() => setCsrfToken('demo-token-12345'))
    }
  }, [isLoggedIn])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username }),
      })
      if (response.ok) {
        setIsLoggedIn(true)
        addToHistory(language === 'en' ? '✅ Logged in successfully' : '✅ Успішно залогінені', 'success')
      }
    } catch (error) {
      setIsLoggedIn(true)
      setCsrfToken('demo-token-12345')
        addToHistory(language === 'en' ? '✅ Logged in successfully (simulated)' : '✅ Успішно залогінені (симуляція)', 'success')
    }
  }

  const handleAction = async (withToken) => {
    const action = withToken ? 'change-email' : 'change-email-no-token'
    const body = withToken 
      ? { email: 'attacker@evil.com', csrfToken }
      : { email: 'attacker@evil.com' }

    try {
      const response = await fetch(`/api/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      const data = await response.json()
      
      if (response.ok) {
        addToHistory(`✅ Action successful: ${data.message}`, 'success')
        setLastAction('success')
      } else {
        addToHistory(`❌ Action blocked: ${data.error}`, 'error')
        setLastAction('blocked')
      }
    } catch (error) {
      if (withToken) {
        addToHistory('✅ Action successful: Email changed (simulated)', 'success')
        setLastAction('success')
      } else {
        addToHistory('❌ Action blocked: Missing CSRF token (simulated)', 'error')
        setLastAction('blocked')
      }
    }
  }

  const addToHistory = (message, type) => {
    setActionHistory(prev => [
      { message, type, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9)
    ])
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
    setCsrfToken('')
    setActionHistory([])
    setLastAction('')
  }

  return (
    <div className="csrf-lab">
      <div className="lab-header">
        <h1>🔵 {t('csrf.title')}</h1>
        <p className="lab-description">
          {t('csrf.description')}
        </p>
      </div>

      <div className="session-section">
        <h2>{t('csrf.sessionManagement')}</h2>
        {!isLoggedIn ? (
          <div className="login-form">
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="username">{t('csrf.username')}</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('csrf.enterUsername')}
                  required
                />
              </div>
              <button type="submit" className="login-btn">
                {t('csrf.login')}
              </button>
            </form>
            <div className="info-box">
              <p>
                <strong>{language === 'en' ? 'Note:' : 'Примітка:'}</strong> {t('csrf.loginNote')}
              </p>
            </div>
          </div>
        ) : (
          <div className="session-info">
            <div className="session-card">
              <h3>✅ {t('csrf.activeSession')}</h3>
              <p><strong>{t('csrf.username')}</strong> {username}</p>
              <p><strong>{t('csrf.csrfToken')}</strong> <code>{csrfToken}</code></p>
              <p className="session-note">
                {t('csrf.sessionNote')}
              </p>
              <button onClick={handleLogout} className="logout-btn">
                {t('csrf.logout')}
              </button>
            </div>
          </div>
        )}
      </div>

      {isLoggedIn && (
        <>
          <div className="csrf-demo-section">
            <h2>{t('csrf.attackSimulation')}</h2>
            
            <div className="demo-cards">
              <div className="demo-card danger">
                <h3>❌ {t('csrf.withoutToken')}</h3>
                <p>
                  {t('csrf.withoutTokenDesc')}
                </p>
                <CodeBlock language="html">
{`<!-- Attacker's malicious page -->
<form action="http://localhost:3001/api/change-email-no-token" method="POST">
  <input type="hidden" name="email" value="attacker@evil.com">
  <button>Click for free prize!</button>
</form>
<script>document.forms[0].submit();</script>`}
                </CodeBlock>
                <button 
                  onClick={() => handleAction(false)}
                  className="demo-btn danger"
                >
                  {t('csrf.simulateAttack')}
                </button>
              </div>

              <div className="demo-card safe">
                <h3>✅ {t('csrf.withToken')}</h3>
                <p>
                  {t('csrf.withTokenDesc')}
                </p>
                <CodeBlock language="html">
{`<!-- Attacker's page (will fail) -->
<form action="http://localhost:3001/api/change-email" method="POST">
  <input type="hidden" name="email" value="attacker@evil.com">
  <input type="hidden" name="csrfToken" value="???">
  <!-- Attacker doesn't know the token! -->
  <button>Click for free prize!</button>
</form>`}
                </CodeBlock>
                <button 
                  onClick={() => handleAction(true)}
                  className="demo-btn success"
                >
                  {t('csrf.simulateProtected')}
                </button>
              </div>
            </div>
          </div>

          <div className="action-result">
            <h2>{t('csrf.lastActionResult')}</h2>
            <div className={`result-box ${lastAction}`}>
              {lastAction === 'success' && (
                <div>
                  <strong>✅ {t('csrf.success')}</strong>
                  <p>{t('csrf.successDesc')}</p>
                </div>
              )}
              {lastAction === 'blocked' && (
                <div>
                  <strong>❌ {t('csrf.blocked')}</strong>
                  <p>{t('csrf.blockedDesc')}</p>
                </div>
              )}
              {!lastAction && (
                <p className="placeholder">{t('csrf.clickButton')}</p>
              )}
            </div>
          </div>

          <div className="history-section">
            <h2>{t('csrf.actionHistory')}</h2>
            <div className="history-list">
              {actionHistory.length === 0 ? (
                <p className="placeholder">{t('csrf.noActions')}</p>
              ) : (
                actionHistory.map((item, idx) => (
                  <div key={idx} className={`history-item ${item.type}`}>
                    <span className="timestamp">{item.timestamp}</span>
                    <span className="message">{item.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <div className="explanation-section">
        <h2>{t('csrf.howProtectionWorks')}</h2>
        
        <div className="explanation-card">
          <h3>🔴 {t('csrf.problemTitle')}</h3>
          <p>
            {t('csrf.problemText')}
          </p>
          <ul>
            <li>{t('csrf.problem1')}</li>
            <li>{t('csrf.problem2')}</li>
            <li>{t('csrf.problem3')}</li>
            <li>{t('csrf.problem4')}</li>
          </ul>
        </div>

        <div className="explanation-card">
          <h3>✅ {t('csrf.solutionTitle')}</h3>
          <p>
            {t('csrf.solutionText')}
          </p>
          <CodeBlock language="javascript">
{`// Server generates token
const csrfToken = generateRandomToken()

// Client includes token in requests
fetch('/api/change-email', {
  method: 'POST',
  body: JSON.stringify({
    email: 'new@email.com',
    csrfToken: csrfToken  // Required!
  })
})

// Server validates token
if (request.csrfToken !== session.csrfToken) {
  return res.status(403).json({ error: 'Invalid CSRF token' })
}`}
          </CodeBlock>
        </div>

        <div className="explanation-card">
          <h3>📚 {t('csrf.csrfTakeaways')}</h3>
          <ul className="takeaways">
            <li>
              <strong>{language === 'en' ? 'Same-Origin Policy doesn\'t prevent CSRF:' : 'Політика Same-Origin не запобігає CSRF:'}</strong> {t('csrf.csrfTakeaway1')}
            </li>
            <li>
              <strong>{language === 'en' ? 'CSRF tokens must be:' : 'CSRF токени повинні бути:'}</strong> {t('csrf.csrfTakeaway2')}
            </li>
            <li>
              <strong>{language === 'en' ? 'Use for state-changing operations:' : 'Використовуйте для операцій, що змінюють стан:'}</strong> {t('csrf.csrfTakeaway3')}
            </li>
            <li>
              <strong>{language === 'en' ? 'Alternative protections:' : 'Альтернативні захисти:'}</strong> {t('csrf.csrfTakeaway4')}
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CsrfLab

