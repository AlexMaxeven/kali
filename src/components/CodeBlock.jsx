import './CodeBlock.css'

function CodeBlock({ language = 'javascript', children }) {
  return (
    <pre className="code-block">
      <code className={`language-${language}`}>{children}</code>
    </pre>
  )
}

export default CodeBlock

