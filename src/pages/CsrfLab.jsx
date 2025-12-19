import { useState, useEffect, useRef } from 'react'
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
  const [lastActionWithToken, setLastActionWithToken] = useState(false)
  const [actionHistory, setActionHistory] = useState([])
  const sessionRef = useRef(null)
  const demoSectionRef = useRef(null)
  const resultSectionRef = useRef(null)

  useEffect(() => {
    if (isLoggedIn && !csrfToken) {
      // Спробуємо отримати токен з backend, якщо він доступний
      fetch('/api/csrf-token', {
        credentials: 'include',
      })
        .then(res => {
          if (res.ok) {
            return res.json()
          }
          throw new Error('Backend unavailable')
        })
        .then(data => {
          if (data.token) {
            setCsrfToken(data.token)
          } else {
            // Якщо токен не прийшов, генеруємо для симуляції
            setCsrfToken(`demo-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
          }
        })
        .catch(() => {
          // Backend недоступний - генеруємо токен для симуляції
          setCsrfToken(prevToken => {
            if (prevToken) return prevToken
            return `demo-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          })
        })
    }
  }, [isLoggedIn]) // Прибрано csrfToken, щоб уникнути зациклення

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!username.trim()) {
      addToHistory('login.error', 'error')
      return
    }
    
    // Додаємо повідомлення про спробу логіну
    addToHistory('login.attempting', 'info')
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username }),
      }).catch((networkError) => {
        // Якщо мережева помилка (наприклад, CORS або недоступний сервер)
        throw new Error('Network error: ' + networkError.message)
      })
      
      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        setIsLoggedIn(true)
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken)
        } else {
          // Якщо токен не прийшов, генеруємо для симуляції
          const simulatedToken = `demo-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          setCsrfToken(simulatedToken)
        }
        addToHistory('login.success', 'success')
        
        // Скрол до демо секції після логіну
        setTimeout(() => {
          if (demoSectionRef.current) {
            demoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      } else {
        // Backend доступний, але повернув помилку - використовуємо симуляцію
        throw new Error('Backend returned error, using simulation')
      }
    } catch (error) {
      // Backend недоступний (наприклад, на GitHub Pages) - використовуємо симуляцію
      console.log('Backend unavailable, using simulation mode:', error.message)
      setIsLoggedIn(true)
      // Генеруємо унікальний токен для симуляції
      const simulatedToken = `demo-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setCsrfToken(simulatedToken)
      addToHistory('login.successSimulated', 'success')
      
      // Скрол до демо секції після логіну
      setTimeout(() => {
        if (demoSectionRef.current) {
          demoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  const handleAction = async (withToken, useProtectedEndpoint = false) => {
    // useProtectedEndpoint=true означає захищений endpoint БЕЗ токену (має бути заблоковано)
    if (!csrfToken && withToken) {
      addToHistory('token.notAvailable', 'error')
      return
    }

    let action, body
    if (useProtectedEndpoint) {
      // Захищений endpoint БЕЗ токену - має бути заблоковано
      action = 'change-email'
      body = { email: 'attacker@evil.com' } // НЕ додаємо токен!
    } else if (withToken) {
      // Захищений endpoint З токеном
      action = 'change-email'
      body = { email: 'attacker@evil.com', csrfToken }
    } else {
      // Незахищений endpoint
      action = 'change-email-no-token'
      body = { email: 'attacker@evil.com' }
    }

    try {
      let response
      try {
        response = await fetch(`/api/${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        })
      } catch (networkError) {
        // Мережева помилка - backend недоступний
        throw new Error('Network error: ' + networkError.message)
      }

      // Перевіряємо чи backend доступний (на GitHub Pages буде 404)
      if (!response || response.status === 404 || response.status === 0 || response.status >= 500) {
        // Backend недоступний - використовуємо симуляцію
        throw new Error('Backend unavailable')
      }

      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        addToHistory('action.success', 'success', withToken, { message: data.message || 'Email changed' })
        setLastAction('success')
        setLastActionWithToken(withToken)
        
        // Скрол до результату
        setTimeout(() => {
          if (resultSectionRef.current) {
            resultSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      } else {
        // Backend доступний, але повернув помилку - це реальна помилка
        const data = await response.json().catch(() => ({ error: 'Unknown error' }))
        
        // Логіка для реального backend:
        // - Незахищений endpoint (без токену) - має працювати (вразливий)
        // - Захищений endpoint з токеном - має працювати (токен правильний)
        // - Захищений endpoint без токену - має бути заблоковано
        
        if (useProtectedEndpoint) {
          // Захищений endpoint БЕЗ токену - має бути заблоковано
          addToHistory('action.blocked', 'error', false, { error: data.error || 'Missing CSRF token' })
          setLastAction('blocked')
          setLastActionWithToken(false)
        } else if (!withToken) {
          // Незахищений endpoint - має працювати (вразливий до CSRF)
          addToHistory('action.successVulnerable', 'success', false)
          setLastAction('success')
          setLastActionWithToken(false)
        } else if (data.error?.includes('CSRF') || data.error?.includes('token')) {
          // Захищений endpoint, але токен невалідний (не повинно бути, бо токен правильний)
          addToHistory('action.blockedInvalidToken', 'error', true, { error: data.error || 'Invalid CSRF token' })
          setLastAction('blocked')
          setLastActionWithToken(true)
        } else {
          // Інша помилка
          addToHistory('action.blockedRequestFailed', 'error', withToken, { error: data.error || 'Request failed' })
          setLastAction('blocked')
          setLastActionWithToken(withToken)
        }
        
        // Скрол до результату
        setTimeout(() => {
          if (resultSectionRef.current) {
            resultSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      }
    } catch (error) {
      // Backend недоступний - використовуємо симуляцію
      console.log('Backend unavailable, using simulation mode:', error.message)
      console.log('Simulation params:', { withToken, useProtectedEndpoint })
      
      // Логіка симуляції:
      // - З токеном (захищений endpoint) → успішно (токен правильний)
      // - Без токену (незахищений endpoint) → успішно (немає перевірки, тому вразливий)
      // - Захищений endpoint БЕЗ токену → заблоковано (правильний захист)
      if (useProtectedEndpoint) {
        // Захищений endpoint БЕЗ токену - має бути заблоковано
        console.log('Simulating: Protected endpoint without token -> BLOCKED')
        addToHistory('action.blockedSimulated', 'error', false)
        setLastAction('blocked')
        setLastActionWithToken(false)
      } else if (withToken) {
        // Захищений endpoint з токеном - має працювати
        console.log('Simulating: Protected endpoint with token -> SUCCESS')
        addToHistory('action.successSimulated', 'success', true)
        setLastAction('success')
        setLastActionWithToken(true)
      } else {
        // Незахищений endpoint без токену - вразливий до CSRF, тому працює
        console.log('Simulating: Unprotected endpoint without token -> SUCCESS (vulnerable)')
        addToHistory('action.successVulnerableSimulated', 'success', false)
        setLastAction('success')
        setLastActionWithToken(false)
      }
      
      // Скрол до результату
      setTimeout(() => {
        if (resultSectionRef.current) {
          resultSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  const addToHistory = (messageKey, type, withToken = null, params = {}) => {
    // Визначаємо тип для історії: якщо success без токену - це vulnerable
    const historyType = (type === 'success' && withToken === false) ? 'vulnerable' : type
    setActionHistory(prev => [
      { messageKey, type: historyType, timestamp: new Date().toLocaleTimeString(), params },
      ...prev.slice(0, 9)
    ])
  }

  const getHistoryMessage = (item) => {
    // Якщо це старий формат (без messageKey), повертаємо як є
    if (item.message) return item.message
    
    if (!item.messageKey) return ''
    
    // Новий формат - використовуємо переклади
    const params = item.params || {}
    const messages = {
      'login.attempting': language === 'en' ? '⏳ Attempting to login...' : '⏳ Спроба входу...',
      'login.success': language === 'en' ? '✅ Logged in successfully' : '✅ Успішно залогінені',
      'login.successSimulated': language === 'en' ? '✅ Logged in successfully (simulated)' : '✅ Успішно залогінені (симуляція)',
      'login.error': language === 'en' ? '❌ Please enter a username' : '❌ Будь ласка, введіть ім\'я користувача',
      'token.notAvailable': language === 'en' 
        ? '❌ CSRF token not available. Please wait or try logging in again.' 
        : '❌ CSRF токен недоступний. Будь ласка, зачекайте або спробуйте увійти знову.',
      'action.success': language === 'en' 
        ? `✅ Action successful: ${params.message || 'Email changed'}` 
        : `✅ Дія успішна: ${params.message || 'Email змінено'}`,
      'action.successVulnerable': language === 'en'
        ? '✅ Action successful: Email changed (vulnerable endpoint - no CSRF protection)'
        : '✅ Дія успішна: Email змінено (вразливий endpoint - немає CSRF захисту)',
      'action.successSimulated': language === 'en'
        ? '✅ Action successful: Email changed (simulated - CSRF token validated)'
        : '✅ Дія успішна: Email змінено (симуляція - CSRF токен перевірено)',
      'action.successVulnerableSimulated': language === 'en'
        ? '✅ Action successful: Email changed (simulated - NO CSRF protection, vulnerable!)'
        : '✅ Дія успішна: Email змінено (симуляція - НЕМАЄ CSRF захисту, вразливо!)',
      'action.blocked': language === 'en'
        ? `❌ Action blocked: ${params.error || 'Missing CSRF token'}`
        : `❌ Дія заблокована: ${params.error || 'Відсутній CSRF токен'}`,
      'action.blockedSimulated': language === 'en'
        ? '❌ Action blocked: Missing CSRF token (simulated - protection working!)'
        : '❌ Дія заблокована: Відсутній CSRF токен (симуляція - захист працює!)',
      'action.blockedInvalidToken': language === 'en'
        ? `❌ Action blocked: ${params.error || 'Invalid CSRF token'}`
        : `❌ Дія заблокована: ${params.error || 'Невірний CSRF токен'}`,
      'action.blockedRequestFailed': language === 'en'
        ? `❌ Action blocked: ${params.error || 'Request failed'}`
        : `❌ Дія заблокована: ${params.error || 'Помилка запиту'}`,
    }
    
    return messages[item.messageKey] || item.messageKey
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
    setCsrfToken('')
    setActionHistory([])
    setLastAction('')
    setLastActionWithToken(false)
  }

  return (
    <div className={`csrf-lab language-${language}`} key={language}>
      <div className="lab-header">
        <h1>🔵 {t('csrf.title')}</h1>
        <p className="lab-description">
          {t('csrf.description')}
        </p>
      </div>

      <div className="session-section" ref={sessionRef}>
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
                  lang="uk"
                  inputMode="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleLogin(e)
                    }
                  }}
                />
              </div>
              <button 
                type="button" 
                className="login-btn"
                onClick={handleLogin}
              >
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
              <p><strong>{t('csrf.csrfToken')}</strong> <code>{csrfToken || '(generating...)'}</code></p>
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
          <div className="csrf-demo-section" ref={demoSectionRef}>
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

              <div className="demo-card warning">
                <h3>🛡️ {language === 'en' ? 'Protected Endpoint (No Token)' : 'Захищений Endpoint (Без токену)'}</h3>
                <p>
                  {language === 'en'
                    ? 'What happens when an attacker tries to use the protected endpoint without a CSRF token? The request is BLOCKED!'
                    : 'Що відбувається, коли атакуючий намагається використати захищений endpoint без CSRF токену? Запит БЛОКУЄТЬСЯ!'}
                </p>
                <CodeBlock language="html">
{`<!-- Attacker tries protected endpoint without token -->
<form action="http://localhost:3001/api/change-email" method="POST">
  <input type="hidden" name="email" value="attacker@evil.com">
  <!-- No CSRF token - request will be BLOCKED! -->
  <button>Click for free prize!</button>
</form>`}
                </CodeBlock>
                <button 
                  onClick={() => handleAction(false, true)}
                  className="demo-btn warning"
                >
                  {language === 'en' ? 'Test Protection' : 'Тестувати захист'}
                </button>
              </div>

              <div className="demo-card safe">
                <h3>✅ {t('csrf.withToken')}</h3>
                <p>
                  {t('csrf.withTokenDesc')}
                </p>
                <CodeBlock language="html">
{csrfToken ? `<!-- Legitimate request with valid CSRF token -->
<form action="http://localhost:3001/api/change-email" method="POST">
  <input type="hidden" name="email" value="attacker@evil.com">
  <input type="hidden" name="csrfToken" value="${csrfToken}">
  <!-- This token was obtained from the legitimate session -->
  <button>Click for free prize!</button>
</form>` : `<!-- Attacker's page (will fail) -->
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

          <div className="action-result" ref={resultSectionRef}>
            <h2>{t('csrf.lastActionResult')}</h2>
            <div className={`result-box ${lastAction} ${lastAction === 'success' && !lastActionWithToken ? 'vulnerable' : ''}`}>
              {lastAction === 'success' && (
                <div>
                  {lastActionWithToken ? (
                    <>
                      <strong>✅ {t('csrf.success')}</strong>
                      <p>
                        {language === 'en' 
                          ? 'Request was accepted because it included a valid CSRF token.'
                          : 'Запит було прийнято, оскільки він включав валідний CSRF токен.'}
                      </p>
                    </>
                  ) : (
                    <>
                      <strong>⚠️ {language === 'en' ? 'VULNERABLE - Request Accepted' : 'ВРАЗЛИВО - Запит прийнято'}</strong>
                      <p>
                        {language === 'en'
                          ? 'Request was accepted, but this endpoint is VULNERABLE - it has no CSRF protection!'
                          : 'Запит було прийнято, але цей endpoint ВРАЗЛИВИЙ - він не має CSRF захисту!'}
                      </p>
                    </>
                  )}
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
                    <span className="message">{getHistoryMessage(item)}</span>
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

