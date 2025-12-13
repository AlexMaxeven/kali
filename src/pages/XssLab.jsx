import { useState } from 'react'
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
  const [payload, setPayload] = useState('<img onerror="alert(1)">')

  const handlePayloadClick = (payload) => {
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
    if (unsafeMode) {
      setRenderedContent(userInput)
    } else {
      setRenderedContent(sanitizeHtml(userInput))
    }
  }

  const commonPayloads = [
    '<img onerror="alert(1)">',
    '<script>alert("XSS")</script>',
    '<svg onload="alert(1)">',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<body onload="alert(1)">',
    '<input onfocus="alert(1)" autofocus>',
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
            setUnsafeMode(!unsafeMode)
            // Перерендеримо контент при зміні режиму
            if (userInput) {
              if (!unsafeMode) {
                setRenderedContent(sanitizeHtml(userInput))
              } else {
                setRenderedContent(userInput)
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
              <div
                dangerouslySetInnerHTML={{ __html: renderedContent }}
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

