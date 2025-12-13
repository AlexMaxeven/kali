import './ToggleMode.css'

function ToggleMode({ unsafeMode, onToggle }) {
  return (
    <div className="toggle-mode">
      <div className="toggle-label">
        <span className={unsafeMode ? 'active' : ''}>Unsafe Mode</span>
        <span className={!unsafeMode ? 'active' : ''}>Safe Mode</span>
      </div>
      <div className="toggle-switch" onClick={onToggle}>
        <div className={`toggle-slider ${unsafeMode ? 'unsafe' : 'safe'}`}>
          <span className="toggle-icon">
            {unsafeMode ? '⚠️' : '✅'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ToggleMode

