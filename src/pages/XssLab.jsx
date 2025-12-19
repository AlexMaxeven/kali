import { useState, useEffect, useRef } from 'react'
import { sanitizeHtml } from '../utils/sanitizeHtml'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../utils/translations'
import ToggleMode from '../components/ToggleMode'
import CodeBlock from '../components/CodeBlock'
import './XssLab.css'

function XssLab() {
  const { language } = useLanguage()
  const t = (key) => getTranslation(key, language)
  const [unsafeMode, setUnsafeMode] = useState(true)
  const [userInput, setUserInput] = useState('')
  const [renderedContent, setRenderedContent] = useState('')
  const [payload, setPayload] = useState('<img src=x onerror="alert(1)">')
  const [originalPayload, setOriginalPayload] = useState('')
  const [isBlocked, setIsBlocked] = useState(false)
  const outputRef = useRef(null)
  const iframeRef = useRef(null)
  const renderTimeoutRef = useRef(null)

  // Очищення стану при розмонтуванні компонента
  useEffect(() => {
    return () => {
      if (window.xssFired) {
        delete window.xssFired
      }
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current)
        renderTimeoutRef.current = null
      }
    }
  }, [])

  // Скрол вгору при монтуванні
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Прямий доступ до DOM для рендерингу XSS payloads (обхід обмежень React)
  // Використовуємо iframe для ізоляції, щоб payloads не могли впливати на основну сторінку
  useEffect(() => {
    let isMounted = true
    let retryTimer = null
    let contentTimer = null
    const maxRetries = 5
    let retryCount = 0
    
    const updateIframe = () => {
      if (!isMounted) return
      
      if (!iframeRef.current) {
        if (retryCount < maxRetries) {
          retryCount++
          retryTimer = setTimeout(updateIframe, 50)
        }
        return
      }

      const iframe = iframeRef.current
      let iframeDoc
      
      try {
        iframeDoc = iframe.contentDocument || iframe.contentWindow.document
        if (!iframeDoc) {
          if (retryCount < maxRetries) {
            retryCount++
            retryTimer = setTimeout(updateIframe, 50)
          }
          return
        }
      } catch (e) {
        // Якщо iframe ще не готовий, спробуємо ще раз через трохи часу
        if (retryCount < maxRetries) {
          retryCount++
          retryTimer = setTimeout(updateIframe, 50)
        }
        return
      }
      
      // Завжди очищаємо попередній контент перед новим рендерингом
      // Спочатку очищаємо iframe, щоб видалити попередні скрипти та події
      try {
        iframeDoc.open()
        iframeDoc.write('<!DOCTYPE html><html><head></head><body></body></html>')
        iframeDoc.close()
      } catch (e) {
        // Ігноруємо помилки при очищенні
      }
      
      // Невелика затримка перед записом нового контенту, щоб попередній контент точно очистився
      contentTimer = setTimeout(() => {
        if (!isMounted || !iframeRef.current) return
        
        // Перевіряємо, чи renderedContent не змінився під час затримки
        const currentContent = renderedContent
        const currentMode = unsafeMode
        
        try {
          iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document
          if (!iframeDoc) return
          
          iframeDoc.open()
          
          if (currentContent) {
            if (currentMode) {
              // В небезпечному режимі вставляємо HTML напряму в iframe
              iframeDoc.write(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <style>
                      body {
                        margin: 0;
                        padding: 1rem;
                        background: rgba(255, 255, 255, 0.05);
                        color: #fff;
                        font-family: system-ui, sans-serif;
                        animation: fadeIn 0.3s ease-in;
                      }
                      @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                      }
                      img { max-width: 100%; height: auto; display: block; margin: 0.5rem 0; }
                      svg { display: block; margin: 0.5rem 0; }
                      input { padding: 0.5rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; color: #fff; margin: 0.5rem 0; }
                    </style>
                  </head>
                  <body>${currentContent}</body>
                </html>
              `)
            } else {
              // В безпечному режимі санітизуємо
              const sanitized = sanitizeHtml(currentContent)
              iframeDoc.write(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <style>
                      body {
                        margin: 0;
                        padding: 1rem;
                        background: rgba(255, 255, 255, 0.05);
                        color: #fff;
                        font-family: system-ui, sans-serif;
                        animation: fadeIn 0.3s ease-in;
                      }
                      @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                      }
                    </style>
                  </head>
                  <body>${sanitized}</body>
                </html>
              `)
            }
          } else {
            // Очищаємо iframe якщо немає що рендерити
            iframeDoc.write('<!DOCTYPE html><html><head></head><body></body></html>')
          }
          
          iframeDoc.close()
        } catch (e) {
          // Ігноруємо помилки при записі
          console.error('Error updating iframe:', e)
        }
      }, 20)
    }
    
    // Невелика затримка, щоб iframe встиг створитися (якщо перестворюється через key)
    const timer = setTimeout(updateIframe, 10)

    return () => {
      isMounted = false
      clearTimeout(timer)
      if (retryTimer) clearTimeout(retryTimer)
      if (contentTimer) clearTimeout(contentTimer)
    }
  }, [renderedContent, unsafeMode])

  const handlePayloadClick = (payload) => {
    // Очищаємо попередній таймер, якщо він є
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current)
      renderTimeoutRef.current = null
    }
    
    // Очищаємо стан перед новим рендерингом
    if (window.xssFired) {
      delete window.xssFired
    }
    
    // Спочатку очищаємо renderedContent, щоб iframe очистився перед новим рендерингом
    setRenderedContent('')
    setIsBlocked(false)
    
    // Встановлюємо нові значення
    setPayload(payload)
    setUserInput(payload)
    setOriginalPayload(payload)
    
    // Автоматично рендеримо при виборі швидкого payload після невеликої затримки
    // Це дає час iframe очиститися перед новим рендерингом
    renderTimeoutRef.current = setTimeout(() => {
      renderTimeoutRef.current = null
      if (unsafeMode) {
        setRenderedContent(payload)
        setIsBlocked(false)
      } else {
        const sanitized = sanitizeHtml(payload)
        setRenderedContent(sanitized)
        // Перевіряємо, чи payload був заблокований (якщо санітизований відрізняється від оригіналу)
        setIsBlocked(sanitized !== payload && payload.trim() !== '')
      }
      
      // Скрол до результату після рендерингу
      setTimeout(() => {
        if (outputRef.current) {
          outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }, 50)
  }

  const handleRender = () => {
    // Очищаємо попередній таймер, якщо він є
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current)
      renderTimeoutRef.current = null
    }
    
    // Очищаємо стан перед новим рендерингом
    if (window.xssFired) {
      delete window.xssFired
    }
    
    // Спочатку очищаємо renderedContent, щоб iframe очистився перед новим рендерингом
    setRenderedContent('')
    setIsBlocked(false)
    
    // Зберігаємо оригінальний payload для порівняння
    setOriginalPayload(userInput)
    
    // Встановлюємо новий контент після невеликої затримки
    renderTimeoutRef.current = setTimeout(() => {
      renderTimeoutRef.current = null
      if (unsafeMode) {
        setRenderedContent(userInput)
        setIsBlocked(false)
      } else {
        const sanitized = sanitizeHtml(userInput)
        setRenderedContent(sanitized)
        // Перевіряємо, чи payload був заблокований (якщо санітизований відрізняється від оригіналу)
        setIsBlocked(sanitized !== userInput && userInput.trim() !== '')
      }
      
      // Скрол до результату після рендерингу
      setTimeout(() => {
        if (outputRef.current) {
          outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }, 50)
  }

  const commonPayloads = [
    '<img src=x onerror="alert(1)">',
    '<img src="invalid" onerror="alert(\'XSS\')">',
    '<svg onload="alert(1)"></svg>',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<body onload="alert(1)">',
    '<input onfocus="(function(){if(!window.xssFired){window.xssFired=true;alert(1);this.blur();}})()" autofocus>',
  ]

  return (
    <div className="xss-lab">
      <div className="lab-header">
        <h1>🔴 {t('xss.title')}</h1>
        <p className="lab-description">
          {t('xss.description')}
        </p>
      </div>

      <div className="mode-toggle-section">
        <ToggleMode 
          unsafeMode={unsafeMode} 
          onToggle={() => {
            // Очищаємо стан перед зміною режиму
            if (window.xssFired) {
              delete window.xssFired
            }
            
            setUnsafeMode(!unsafeMode)
            // Перерендеримо контент при зміні режиму
            if (userInput || renderedContent) {
              const contentToRender = userInput || renderedContent
              if (!unsafeMode) {
                const sanitized = sanitizeHtml(contentToRender)
                setRenderedContent(sanitized)
                setIsBlocked(sanitized !== contentToRender && contentToRender.trim() !== '')
                setOriginalPayload(contentToRender)
              } else {
                setRenderedContent(contentToRender)
                setIsBlocked(false)
              }
            } else {
              setIsBlocked(false)
            }
          }}
        />
      </div>

      <div className="warning-banner" style={{ 
        backgroundColor: unsafeMode ? 'rgba(220, 53, 69, 0.2)' : 'rgba(40, 167, 69, 0.2)',
        borderColor: unsafeMode ? '#dc3545' : '#28a745'
      }}>
        {unsafeMode ? (
          <>
            <strong>⚠️ {t('xss.unsafeActive')}</strong>
            <p>{t('xss.unsafeDesc')}</p>
          </>
        ) : (
          <>
            <strong>✅ {t('xss.safeActive')}</strong>
            <p>{t('xss.safeDesc')}</p>
          </>
        )}
      </div>

      <div className="input-section">
        <h2>{t('xss.tryPayloads')}</h2>
        <div className="input-group">
          <label htmlFor="user-input">{t('xss.enterPayload')}</label>
          <div className="input-with-button">
            <input
              id="user-input"
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRender()
                }
              }}
              placeholder={language === 'en' ? 'Enter XSS payload here...' : 'Введіть XSS payload тут...'}
              className="payload-input"
            />
            <button 
              onClick={handleRender}
              className="render-btn"
              disabled={!userInput.trim()}
            >
              {language === 'en' ? 'Render' : 'Відрендерити'}
            </button>
          </div>
        </div>

        <div className="quick-payloads">
          <h3>{t('xss.quickPayloads')}</h3>
          <div className="payload-buttons">
            {commonPayloads.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handlePayloadClick(p)}
                className="payload-btn"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="output-section" ref={outputRef}>
        <h2>{t('xss.output')}</h2>
        
        {isBlocked && !unsafeMode && (
          <div className="blocked-banner">
            <div className="blocked-icon">🛡️</div>
            <div className="blocked-content">
              <strong>
                {language === 'en' 
                  ? '✅ XSS Payload Blocked!' 
                  : '✅ XSS Payload заблоковано!'}
              </strong>
              <p>
                {language === 'en'
                  ? 'The malicious code was sanitized and removed by DOMPurify. Your application is protected!'
                  : 'Зловмисний код було санітизовано та видалено DOMPurify. Ваш додаток захищено!'}
              </p>
              <div className="payload-comparison">
                <div className="comparison-item">
                  <span className="comparison-label">
                    {language === 'en' ? 'Original:' : 'Оригінал:'}
                  </span>
                  <code className="original-payload">{originalPayload}</code>
                </div>
                <div className="comparison-arrow">→</div>
                <div className="comparison-item">
                  <span className="comparison-label">
                    {language === 'en' ? 'Sanitized:' : 'Санітизовано:'}
                  </span>
                  <code className="sanitized-payload">{renderedContent || '(empty)'}</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {renderedContent && unsafeMode && (
          <div className="executed-banner">
            <div className="executed-icon">⚠️</div>
            <div className="executed-content">
              <strong>
                {language === 'en' 
                  ? '🔴 XSS Payload Executed!' 
                  : '🔴 XSS Payload виконано!'}
              </strong>
              <p>
                {language === 'en'
                  ? 'The malicious code has been executed in the iframe. If you don\'t see an alert, it may be blocked by your browser\'s popup blocker or iframe security restrictions. The code still executed successfully!'
                  : 'Зловмисний код було виконано в iframe. Якщо ви не бачите alert, він може бути заблокований блокувальником спливаючих вікон браузера або обмеженнями безпеки iframe. Код все одно виконався успішно!'}
              </p>
              <div className="payload-info">
                <div className="info-item">
                  <span className="info-label">
                    {language === 'en' ? 'Executed payload:' : 'Виконаний payload:'}
                  </span>
                  <code className="executed-payload">{originalPayload || renderedContent}</code>
                </div>
                <div className="info-note">
                  <span className="note-icon">💡</span>
                  <span>
                    {language === 'en'
                      ? 'In a real attack, this code could steal cookies, redirect users, or perform other malicious actions.'
                      : 'У реальній атаці цей код міг би вкрасти cookies, перенаправити користувачів або виконати інші зловмисні дії.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="output-container">
          <div className="output-label">{t('xss.renderedContent')}</div>
          <div className="output-box">
            <iframe
              key={`iframe-${renderedContent}-${unsafeMode}`}
              ref={iframeRef}
              className="xss-iframe"
              title="XSS Output"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>

      <div className="explanation-section">
        <h2>{t('xss.howItWorks')}</h2>
        
        <div className="explanation-card">
          <h3>🔴 {t('xss.unsafeTitle')}</h3>
          <p>
            {t('xss.unsafeText')}
          </p>
          <CodeBlock language="jsx">
{`<div 
  dangerouslySetInnerHTML={{ __html: userInput }}
/>`}
          </CodeBlock>
          <p className="danger-text">
            <strong>{language === 'en' ? 'Problem:' : 'Проблема:'}</strong> {t('xss.unsafeProblem')}
          </p>
        </div>

        <div className="explanation-card">
          <h3>✅ {t('xss.safeTitle')}</h3>
          <p>
            {t('xss.safeText')}
          </p>
          <CodeBlock language="jsx">
{`import DOMPurify from 'dompurify'

<div 
  dangerouslySetInnerHTML={{ 
    __html: DOMPurify.sanitize(userInput) 
  }}
/>`}
          </CodeBlock>
          <p className="success-text">
            <strong>{language === 'en' ? 'Solution:' : 'Рішення:'}</strong> {t('xss.safeSolution')}
          </p>
        </div>

        <div className="explanation-card">
          <h3>📚 {t('xss.takeaways')}</h3>
          <ul className="takeaways">
            <li>
              <strong>{language === 'en' ? 'Never trust user input:' : 'Ніколи не довіряйте користувацькому вводу:'}</strong> {t('xss.takeaway1')}
            </li>
            <li>
              <strong>{language === 'en' ? 'Use DOMPurify:' : 'Використовуйте DOMPurify:'}</strong> {t('xss.takeaway2')}
            </li>
            <li>
              <strong>{language === 'en' ? 'Frontend mitigation:' : 'Захист на frontend:'}</strong> {t('xss.takeaway3')}
            </li>
            <li>
              <strong>{language === 'en' ? 'Content Security Policy (CSP):' : 'Content Security Policy (CSP):'}</strong> {t('xss.takeaway4')}
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default XssLab

