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
  const outputRef = useRef(null)
  const iframeRef = useRef(null)

  // Очищення стану при розмонтуванні компонента
  useEffect(() => {
    return () => {
      if (window.xssFired) {
        delete window.xssFired
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
    // Невелика затримка, щоб iframe встиг створитися (якщо перестворюється через key)
    const timer = setTimeout(() => {
      if (!iframeRef.current) return

      const iframe = iframeRef.current
      let iframeDoc
      
      try {
        iframeDoc = iframe.contentDocument || iframe.contentWindow.document
      } catch (e) {
        // Якщо iframe ще не готовий, спробуємо ще раз через трохи часу
        return
      }
      
      // Завжди очищаємо попередній контент перед новим рендерингом
      iframeDoc.open()
      
      if (renderedContent) {
        if (unsafeMode) {
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
              <body>${renderedContent}</body>
            </html>
          `)
        } else {
          // В безпечному режимі санітизуємо
          const sanitized = sanitizeHtml(renderedContent)
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
    }, 10) // Невелика затримка для надійності

    return () => clearTimeout(timer)
  }, [renderedContent, unsafeMode])

  const handlePayloadClick = (payload) => {
    // Очищаємо стан перед новим рендерингом
    if (window.xssFired) {
      delete window.xssFired
    }
    
    setPayload(payload)
    setUserInput(payload)
    // Автоматично рендеримо при виборі швидкого payload
    if (unsafeMode) {
      setRenderedContent(payload)
    } else {
      setRenderedContent(sanitizeHtml(payload))
    }
  }

  const handleRender = () => {
    // Очищаємо стан перед новим рендерингом
    if (window.xssFired) {
      delete window.xssFired
    }
    
    if (unsafeMode) {
      setRenderedContent(userInput)
    } else {
      setRenderedContent(sanitizeHtml(userInput))
    }
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
                setRenderedContent(sanitizeHtml(contentToRender))
              } else {
                setRenderedContent(contentToRender)
              }
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

      <div className="output-section">
        <h2>{t('xss.output')}</h2>
        <div className="output-container">
          <div className="output-label">{t('xss.renderedContent')}</div>
          <div className="output-box">
            {renderedContent ? (
              <iframe
                key={`${renderedContent}-${unsafeMode}`}
                ref={iframeRef}
                className="xss-iframe"
                title="XSS Output"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="output-placeholder">
                {language === 'en' 
                  ? 'Enter a payload above and click "Render" to see it here...' 
                  : 'Введіть payload вище та натисніть "Відрендерити", щоб побачити його тут...'}
              </div>
            )}
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

